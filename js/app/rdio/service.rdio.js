(function(){
	RDIO_SERVICE = 'rdioService';
	MoveToSpotify.service(RDIO_SERVICE, Service);
	
	Service.$inject = ['$http', '$q', '$location', '$window', '$httpParamSerializer', '$timeout', '$log'];
	
	function Service($http, $q, $location, $window, $httpParamSerializer, $timeout, $log){
		// http://www.rdio.com/developers/app/gml3vqymtzeuzcb77nakopz6hu/
		var CLIENT_ID = "gml3vqymtzeuzcb77nakopz6hu";
		var REDIRECT_URI = "http://move.152.io?rdio=done";
		
		var OAUTH_URI = "https://www.rdio.com/oauth2/authorize";
		var ENDPOINT_URI = "https://services.rdio.com/api/1/";
		
		var TOKEN = 'token';
		var LIBRARY = 'library';
		var FINISHED = 'rdio_finished';
		
		// Set the raw token
		this.setToken = function(token){
			// Store the response
			localStorage.setItem(TOKEN, JSON.stringify(token));
		}
		
		// This will return the raw token
		this.getToken = function(){
			var result = localStorage.getItem(TOKEN);
			if(!result) return null;
			
			return JSON.parse(localStorage.getItem(TOKEN));
		}
		
		// This will return just the access token
		this.getAccessToken = function(){
			// Using the token
			// http://www.rdio.com/developers/docs/web-service/oauth2/overview/ref-oauth2-access-token
			var result = this.getToken();
			if(!result) return null;
			
			return result.access_token;
		}
		
		// Redirect to the auto page
		this.redirectToRdio = function(){
			$window.location.href = OAUTH_URI + '?' + $httpParamSerializer({
				'response_type': 'code',
				'client_id': CLIENT_ID,
				'redirect_uri': REDIRECT_URI,
				'hideSignup': true,
				'showSignup': false
			});
		}
		
		// Add the albums to your library
		function addToLibrary(albums){
			var lib = {'total': 0, 'albums':[]};
			
			// Check to see if we have a lib
			if(localStorage.getItem(LIBRARY)){
				lib = JSON.parse(localStorage.getItem(LIBRARY));
			}
			
			// Update the total
			lib.total += albums.length;
			// Append the albums
			lib.albums = lib.albums.concat(albums);
			
			// Store the results
			localStorage.setItem(LIBRARY, JSON.stringify(lib));
		}
		
		// Check to see if the library is avaliable
		this.isLibraryAvaliable = function(){
			var result = localStorage.getItem(FINISHED);
			
			return (result && result === "true");
		}
		
		// Upate song
		this.updateLibrary = function(song, index){
			
		}
		
		// Get the library
		this.getLibrary = function(){
			var lib = null;
			if(localStorage.getItem(LIBRARY)){
				lib = JSON.parse(localStorage.getItem(LIBRARY));
			}
			
			return lib;
		}
		
		// Go get the albums
		this.getAlbums = function(reset){
			var size = 307; // Make the number prime
			var offset = 0;
			var deferred = $q.defer();
			reset = (typeof reset === "boolean") ? reset : false;
			
			// Clear out the library
			if(reset){
				localStorage.removeItem(LIBRARY);
			}
			
			// All requests are POST
			// http://www.rdio.com/developers/docs/web-service/overview/
			function getAlbums(off, sz){
				var data = $httpParamSerializer({'method': 'getAlbumsInCollection', 'start': off, 'count': sz, 'sort': 'dateAdded'});
				var params = {
					'headers': {
						'content-type': undefined,
						'x-rdio-client-id': CLIENT_ID,
						'Authorization': 'Bearer ' + this.getAccessToken()
					}
				};
				
				// Go get the albums
				$http.post(ENDPOINT_URI + 'getAlbumsInCollection', data, params).then( function(response){
					$log.debug(response);
					var albums = response.data.result;
					
					addToLibrary(albums);
					
					// Check to see if we need to run again
					if(albums.length == sz){
						// So we don't get throttled 
						$timeout(function(){
							getAlbums.call(this, off + sz, sz);
						}.bind(this), 1000);
					}
					else{
						localStorage.setItem(FINISHED, "true");
						deferred.resolve();
					}
					
				}.bind(this), function(response){
					$log.debug(response);
					
					// Check for a bad token error
					// http://www.rdio.com/developers/docs/web-service/oauth2/overview/ref-using-a-refresh-token
					if(response.data.error == "invalid_token"){
						this.getRefreshToken().then( function(){
							// We've got a new token. Try again
							getAlbums.call(this, off, sz);
						}.bind(this), function(){
							alert('Error getting refresh token');
							deferred.reject();
						}.bind(this));
					}
					else{
						deferred.reject();
					}
				}.bind(this));
			}
			
			getAlbums.call(this, offset, size);
			
			return deferred.promise;
		}
		
		// Get a refresh token
		this.getRefreshToken = function(){
			var deferred = $q.defer();
			
			// Get a new token
			$http.post('api.php', {'client':'rdio', 'task': 'refresh_token', 'clientId':CLIENT_ID, 'refresh_token':this.getToken().refresh_token}).then( function(response){
				$log.debug(response);
				// Set the new token here
				this.setToken(response.data);
				deferred.resolve();
			}.bind(this), function(response){
				$log.debug(response);
				deferred.reject();
			});
			
			return deferred.promise;
		}
		
		// Check to see if we have a connection to rdio
		this.checkStatus = function(){
			var deferred = $q.defer();
			var results = null;
			var code = null;
			var token = this.getToken(); 
			
			// Check for the token first
			if(token){
				deferred.resolve();
				return deferred.promise;
			}
			
			// Get the params from the uri
			results = $location.search();
			
			// Check to see if we have the code
			if(results['rdio'] && results['rdio'] === 'done'){
				code = results['code'];
			}
			else{
				deferred.reject();
				return deferred.promise;
			}
			
			// Go get the token
			$http.post('api.php',{'client': 'rdio', 'task':'token', 'redirectUri': REDIRECT_URI, 'clientId': CLIENT_ID, 'code': code}).then(function(result){
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