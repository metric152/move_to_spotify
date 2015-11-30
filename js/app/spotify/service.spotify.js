(function(){
    MoveToSpotify.service(SPOTIFY_SERVICE, Service);
    
    Service.$inject = ['$rootScope', '$http', '$q', '$location', '$window', '$httpParamSerializer', '$timeout', 'localStorageService', LIBRARY_SERVICE, '$log'];
    
    function Service($rootScope, $http, $q, $location, $window, $httpParamSerializer, $timeout, localStorageService, LibraryService, $log){
        var CLIENT_ID = SPOTIFY_CLIENT_ID;
        
        var OAUTH_URI = "https://accounts.spotify.com/authorize";
        var ENDPOINT_URI = "https://api.spotify.com/";
        
        var TOKEN = 'spotify_token';
        var CONNECTED = 'spotify_connected';
        var LIBRARY = 'spotify_library';
        
        var spotifyLibrary = null;
        
        // Check to see if rdio is connected
        this.isConnected = function(){
            var connected = localStorageService.get(CONNECTED);
            
            if(!connected && LibraryService.isLibraryAvaliable()){
                localStorageService.set(CONNECTED, true);
                connected = true;
            }
            
            return connected;
        }
        
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
        
        // Make sure our token is good
        this.checkAccessToken = function(){
            var deferred = $q.defer();
            // Create headers
            var params = {
                'headers': this.getAuthHeader()
            };
            
            $http.get(ENDPOINT_URI + 'v1/me', params).then(deferred.resolve, function(response){
                //  Check for expired token
                if(response.data.error.message.indexOf("token expired") > -1){
                    this.getRefreshToken().then(function(response){
                        deferred.resolve();
                    }.bind(this), function(response){
                        $log.debug('Issue getting refresh token');
                        deferred.reject();
                    }.bind(this));
                }
            }.bind(this));
            
            return deferred.promise;
        }
        
        // Start the OAUTH dance
        this.redirectToSpotify = function(){
            $window.location.href = OAUTH_URI + '?' + $httpParamSerializer({
                'response_type': 'code',
                'client_id': CLIENT_ID,
                'redirect_uri': REDIRECT_URI,
                'state': 'spotify',
                'scope': 'user-library-modify playlist-modify-public playlist-modify-private user-library-read'
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
        
        // Get info about the current album selection
        this.getPreflightInfo = function(all){
            all = (typeof all == "boolean" ? all : false);
            var library = LibraryService.getLibrary();
            var result = {
                'spotifyAlbumIds': [],
                'albumIndex': {},
                'tracks': 0,
                'albums': 0
            };
            
            library.albums.forEach(function(album, index){
                // The album is already added
                if(all && album.added) return;
                
                // The album wasn't selected for import
                if(!album.selected) return;
                // The album wasn't found on spotify
                if(!album.spotifyAlbumId) return;
                
                // Now add the album
                result.spotifyAlbumIds.push(album.spotifyAlbumId);
                
                // Add album
                result.albums++;
                // Add tracks
                result.tracks += album.length;
                
                /**
                 * As I'm looping through this, get the index of the album and store it on the spotifyAlbumId.
                 * That way I have a 1-1 map of the albumId and the index. This should make saving easy
                 */
                result.albumIndex[album.spotifyAlbumId] = {
                    'album': album,
                    'index': index
                };
                
            });
            
            return result;
        }
        
        // Get the spotify library
        this.getLibrary = function(){
            if(spotifyLibrary) return spotifyLibrary;
            
            if(localStorageService.get(LIBRARY)){
                spotifyLibrary = localStorageService.get(LIBRARY);
            }
            else{
                spotifyLibrary = {'total':0, 'tracks': 0};
            }
            
            return spotifyLibrary;
        }
        
        // Save the library
        this.saveLibrary = function(){
            localStorageService.set(LIBRARY, spotifyLibrary);
        }
        
        // Reset the library
        this.resetLibrary = function(){
            var lib = this.getLibrary();
            
            lib = {
                'total': 0,
                'tracks': 0
            };
        }
        
        // Get library from spotify
        this.getAlbums = function(){
            var deferred = $q.defer();
            
            this.checkAccessToken().then(function(){
                var sLib = this.getLibrary();
                var limit = 50;
                var offset = 0;
                var lib = LibraryService.getLibrary();
                
                // Clear the library
                this.resetLibrary();
                
                function getLib(){
                    var params = {
                        'params': {
                            'limit': limit,
                            'offset': offset
                        },
                        'headers': this.getAuthHeader()
                    };
                    
                    $http.get(ENDPOINT_URI + 'v1/me/albums', params).then(function(response){
                        // Get the IDs from the response
                        response.data.items.forEach(function(spotifyAlbum){
                            sLib[spotifyAlbum.album.id] = {
                                'tracks': spotifyAlbum.album.tracks.total
                            };
                            sLib.total++;
                            sLib.tracks += spotifyAlbum.album.tracks.total;
                        });
                        
                        // If the next URI exists we're not done yet
                        if(response.data.next){
                            offset += limit;
                            getLib.call(this);
                        }
                        else{
                            // Update our library
                            lib.albums.forEach(function(album){
                                if(album.spotifyAlbumId && sLib[album.spotifyAlbumId]){
                                    album.added = true;
                                }
                            });
                            LibraryService.saveLibrary();
                            
                            // Store the key/val match
                            this.saveLibrary();
                            
                            deferred.resolve();
                        }
                    }.bind(this), function(response){
                        deferred.reject("Error getting library");
                    }.bind(this));
                }
                
                if(lib.total > 0){
                    getLib.call(this);
                }
                else{
                    deferred.reject("There are no albums to check");
                }
                
            }.bind(this));
            
            return deferred.promise;
        }
        
        // Save just one album to spotify
        this.saveToSpotify = function(album){
            var deferred = $q.defer();
            
            this.checkAccessToken().then(function(){
                
                // Save the album
                $http.put(ENDPOINT_URI + 'v1/me/albums', [album.spotifyAlbumId], {'headers': this.getAuthHeader()}).then(function(){
                    // Mark the album as added
                    album.added = true;
                    // Save the changes
                    LibraryService.saveLibrary();
                    
                    // Update the library
                    this.getAlbums().then(function(){
                        deferred.resolve("Album Saved");
                    });
                    
                }.bind(this), function(response){
                    // We hit the album limit
                    if(response.data.error.message.indexOf("limit exceeded") > -1){
                        deferred.reject("I can't add anymore albums.");
                    }
                });
                
            }.bind(this));
            
            return deferred.promise;
        }
        
        // Save the albums to spotify
        this.save = function(){
            var deferred = $q.defer();
            var library = LibraryService.getLibrary();
            var albumIds = [];
            var albumIndex = {};
            var albumsToSave = this.getPreflightInfo();
            var batchNumber = 5;
            
            if(albumsToSave.albums == 0){
                deferred.reject('Add some albums before you save.');
                return deferred.promise;
            }
            
            this.checkAccessToken().then(function(){
                function save(){
                    var spotifyAlbumIds = albumsToSave.spotifyAlbumIds.splice(0, batchNumber);
                    
                    $http.put(ENDPOINT_URI + 'v1/me/albums', spotifyAlbumIds, {'headers': this.getAuthHeader()}).then(function(){
                        // Update the albums
                        spotifyAlbumIds.forEach(function(spotifyAlbumId){
                            // Mark the album as added with album.added
                            albumsToSave.albumIndex[spotifyAlbumId].album.added = true;
                        });
                        
                        // Save our progress
                        LibraryService.saveLibrary();
                        
                        // Check to see if we need to save again
                        if(albumsToSave.spotifyAlbumIds.length > 0){
                            save.call(this);
                        }
                        else{
                            this.getAlbums().then(function(){
                                deferred.resolve("Albums saved to Spotify");
                            });
                        }
                    }.bind(this), function(response){
                        // We hit the album limit
                        if(response.data.error.message.indexOf("limit exceeded") > -1){
                            this.getAlbums().then(function(){
                                deferred.reject('I can\'t add anymore albums. Use the "Not Yet Added" filter to see what was left out.');
                            });
                        }
                    }.bind(this));
                }
                
                // Start the save process
                save.call(this);
            }.bind(this));
            
            return deferred.promise;
        }
        
        // Search for albums
        this.searchForAlbums = function(){
            var deferred = $q.defer();
            var library = LibraryService.getLibrary();
            var index = 0;
            var found = 0;
            var throttle = 750;
            var stopSearching = false;
            var spotifyLibrary = null;
            
            // If we have no library just stop
            if(library.total == 0) {
                deferred.reject("We don't have a library yet. Connect with Rdio and get your albums.");
                return deferred.promise;
            }
            
            // Check the token before making a request
            this.checkAccessToken().then(function(){
                
                function nextAlbum(now){
                    // Get the next album
                    var theNextAlbum = library.albums[++index];
                    
                    // If we don't have one we're finished
                    if(!theNextAlbum){
                        // Now we're done
                        deferred.resolve("Done searching Spotify");
                    }
                    else if(now){
                        search.call(this, theNextAlbum);
                    }
                    else{
                        // Throttle search
                        $timeout(function(){
                            search.call(this, theNextAlbum);
                        }.bind(this), throttle);
                    }
                }
                
                function search(album){
                    if(stopSearching) return;
                    
                    var albumDate = new Date(album['releaseDate']).getFullYear();
                    
                    // Create headers
                    var params = {
                        'params':{
                            'type':'album',
                            'q': sprintf('album:%s artist:%s year:%s-%s', album['name'], album['artist'], albumDate - 1, albumDate + 1)
                        },
                        'headers': this.getAuthHeader()
                    };
                    
                    // We found this album. Move to the next one
                    if(album.spotifyAlbumId || album.notFound){
                        nextAlbum.call(this, true);
                        return;
                    }
                    
                    // Search for the album
                    $http.get(ENDPOINT_URI + 'v1/search', params).then(function(response){
                        var searchResult = null;

                        response.data.albums.items.forEach(function(result){
                            if(result.name == album['name']) searchResult = result;
                            deferred.notify(++found);
                        });
                        
                        // Save the spotify id
                        if(searchResult){
                            album.spotifyAlbumId = searchResult.id;
                            album.spotifyLink = searchResult.uri;
                            
                            // Check to see if the album exists in the library
                            if(spotifyLibrary[searchResult.id]) album.added = true;
                            
                            // Update the library
                            LibraryService.saveLibrary();
                        }
                        else{
                            // Used for markup control
                            album.notFound = true;
                        }
                        
                        nextAlbum.call(this, false);
                    }.bind(this), function(response){
                        if(response.status == 429){
                            deferred.reject('Too many searches right now. Try again in a little bit.');
                            stopSearching = true;
                        }
                    }.bind(this));
                };
                
                // Use to trigger 429 error
//                library.albums.forEach(function(album){
//                    search.call(this, album);
//                }.bind(this));
                
                // First get the spotify library
                this.getAlbums().then(function(){
                    // Get the library
                    spotifyLibrary = this.getLibrary();
                    
                    search.call(this, library.albums[index]);
                }.bind(this));
                
                
            }.bind(this));
            
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
                
                // Set connected
                localStorageService.set(CONNECTED, true);
                
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