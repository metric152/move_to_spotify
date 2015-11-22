(function(){
	MoveToSpotify.service(SPOTIFY_SERVICE, Service);
	
	Service.$inject = ['$rootScope', '$http', '$q', '$location', '$window', '$httpParamSerializer', '$timeout', 'localStorageService', RDIO_SERVICE, '$log'];
	
	function Service($rootScope, $http, $q, $location, $window, $httpParamSerializer, $timeout, localStorageService, RdioService, $log){
		// https://developer.spotify.com/my-applications/#!/applications/2c2bff3442994bba939ef3fd04e0efce
		var CLIENT_ID = "2c2bff3442994bba939ef3fd04e0efce";
		
		var OAUTH_URI = "https://accounts.spotify.com/authorize";
		var ENDPOINT_URI = "https://api.spotify.com/";
		
		var TOKEN = 'spotify_token';
		var SEARCHED = 'spotify_searched';
		var FINISHED = 'spotify_finished';
		
		// Set the raw token
		this.setToken = function(token){
			localStorageService.set(TOKEN, token);
		}
		
		// Get the raw token
		this.getToken = function(){
			var result = localStorageService.get(TOKEN);
			if(!result) return null;
			
			return result;
		}
		
		// Get the access token
		this.getAccessToken = function(){
			// https://developer.spotify.com/web-api/authorization-guide/
			var result = this.getToken();
			if(!result) return null;
			
			return result.access_token;
		}
		
		// Start the OAUTH dance
		this.redirectToSpotify = function(){
			$window.location.href = OAUTH_URI + '?' + $httpParamSerializer({
				'response_type': 'code',
				'client_id': CLIENT_ID,
				'redirect_uri': REDIRECT_URI,
				'state': 'spotify',
				'scope': 'user-library-modify playlist-modify-public playlist-modify-private'
			});
		}
		
		// Get a refresh token
		this.getRefreshToken = function(){
			var deferred = $q.defer();
			
			// Get a new token
			$http.post('api.php', {'client':'spotify', 'task': 'refresh_token', 'clientId':CLIENT_ID, 'refresh_token':this.getToken().refresh_token}).then( function(response){
				var newToken = angular.merge({}, this.getToken(), response.data);
				// Set the new token here
				this.setToken(newToken);
				deferred.resolve();
			}.bind(this), function(response){
				$log.debug(response);
				deferred.reject();
			});
			
			return deferred.promise;
		}
		
		// Get the auth header for a request
		this.getAuthHeader = function(){
			return {
				'Authorization': 'Bearer ' + this.getAccessToken()
			};
		}
		
		// Check to see if we've searched
		this.isSearched = function(){
		    return localStorageService.get(SEARCHED);
		}
		
		// Save the albums to spotify
		this.save = function(){
			var deferred = $q.defer();
			var library = RdioService.getLibrary();
			var albumIds = [];
			var albumIndex = {};
			
			if(!library || (library && library.total == 0)){
			    deferred.reject('There is no library');
			    return deferred.promise;
			}
			
			library.albums.forEach(function(album, index){
			    // The album is already added
			    if(album.added) return;
			    // The album wasn't selected for import
			    if(album.hasOwnProperty('selected')) return;
			    // The album wasn't found on spotify
			    if(!album.spotifyAlbumId) return;
			    
			    // Now add the album
			    albumIds.push(album.spotifyAlbumId);
			    
			    /**
			     * As I'm looping through this, get the index of the album and store it on the spotifyAlbumId.
			     * That way I have a 1-1 map of the albumId and the index. This should make saving easy
			     */
			    albumIndex[album.spotifyAlbumId] = {
		            'album': album,
		            'index': index
			    };
			    
			}.bind(this));
			
			function save(){
			    // Batch your saves to 50
			    var albumsToSave = albumIds.splice(0,50);
			    
			    $http.put(ENDPOINT_URI + 'v1/me/albums', albumsToSave, {'headers': this.getAuthHeader()}).then(function(){
                    // Update the albums
			        albumsToSave.forEach(function(spotifyAlbumId){
			            // Mark the album as added with album.added
			            albumIndex[spotifyAlbumId].album.added = true;
			            RdioService.updateLibrary(albumIndex[spotifyAlbumId].album, albumIndex[spotifyAlbumId]);
			        })
			        
			        // Check to see if we need to save again
			        if(albumIds.length > 0){
			            save.call(this);
			        }
			        else{
			            // Update the library
	                    $rootScope.$broadcast(LIBRARY_REFRESH);
	                    deferred.resolve();
			        }
                }.bind(this), function(response){
                    //  Check for expired token
                    if(response.data.error.message.indexOf("token expired") > -1){
                        this.getRefreshToken().then(function(response){
                            save.call(this);
                        }.bind(this), function(response){
                            alert('Issue getting refresh token');
                            deferred.reject();
                        }.bind(this));
                    }
                }.bind(this));
			    
			}
			// Start the save process
			save.call(this);
			return deferred.promise;
		}
		
		// Search for albums
		this.searchForAlbums = function(){
			var deferred = $q.defer();
			var library = RdioService.getLibrary();
			var countDown = library.total;
			
			function search(album, index){
				var params = {
					'params':{
						'type':'album',
						'q': sprintf('album:%s artist:%s', album['name'], album['artist'])
					},
					'headers': this.getAuthHeader()
				};
				
				// Search for the album
				$http.get(ENDPOINT_URI + 'v1/search', params).then(function(response){
					var searchResult = response.data.albums.items.pop();
					countDown--;
					
					// Save the spotify id
					if(searchResult){
						album.spotifyAlbumId = searchResult.id;
					}
					else{
					    // Used for markup control
						album.notFound = true;
					}
					
					// Update the library
					RdioService.updateLibrary(album, index);
					
				}.bind(this), function(response){
					//  Check for expired token
					if(response.data.error.message.indexOf("token expired") > -1){
						this.getRefreshToken().then(function(response){
							search.call(this, album, index);
						}.bind(this), function(response){
							alert('Issue getting refresh token');
							deferred.reject();
						}.bind(this));
					}
				}.bind(this))['finally'](function(){
					// Figure out when to update the countdown
					if((countDown % 50) == 0 || countDown == 0){
					    $rootScope.$broadcast(LIBRARY_REFRESH);
					    $rootScope.$broadcast(SPOTIFY_REFRESH);
					}
					
					// Check to see if we need to check the next album
					var nextIndex = ++index;
					
					if(countDown != 0){
						search.call(this, library['albums'][nextIndex], nextIndex);
					}
					else{
						// Now we're done
						deferred.resolve();
						localStorageService.set(SEARCHED, true);
					}
				}.bind(this));
			}
			
			// If we have no library just stop
			if(!library) {
				deferred.reject("We don't have a library yet. Connect with Rdio and get your albums.");
				return deferred.promise;
			}
			
			search.call(this, library['albums'][0], 0);
			
			return deferred.promise;
		}
		
		// Check after the redirect for a code to get a token
		this.checkStatus = function(){
			var deferred = $q.defer();
			var results = null;
			var token = this.getToken();
			var code = null;
			
			// If we have a token we're ready
			if(token){
				deferred.resolve();
				return deferred.promise;
			}
			
			// Get the params from the uri
			results = $location.search();
			
			// Check to see if we have the code
			if(results['state'] && results['state'] === 'spotify' && results['code']){
				code = results['code'];
				// Clean the code and the scope from the URI
				$location.url('');
			}
			else{
				deferred.reject();
				return deferred.promise;
			}
			
			// Go get the token
			$http.post('api.php',{'client': 'spotify', 'task':'token', 'redirectUri': REDIRECT_URI, 'clientId': CLIENT_ID, 'code': code}).then(function(result){
				// Store the response
				this.setToken(result.data);
				
				// Resolve the promise
				deferred.resolve();
			}.bind(this), function(result){
				$log.debug(result.data);
				deferred.reject();
			});
			
			
			return deferred.promise;
		}
	}
})();