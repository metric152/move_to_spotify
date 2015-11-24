(function(){
    MoveToSpotify.service(RDIO_SERVICE, Service);
    
    Service.$inject = ['$rootScope', '$http', '$q', '$location', '$window', '$httpParamSerializer', 'localStorageService', '$log'];
    
    function Service($rootScope, $http, $q, $location, $window, $httpParamSerializer, localStorageService, $log){
        var CLIENT_ID = RDIO_CLIENT_ID;
        
        var OAUTH_URI = "https://www.rdio.com/oauth2/authorize";
        var ENDPOINT_URI = "https://services.rdio.com/api/1/";
        
        var TOKEN = 'rdio_token';
        var LIBRARY = 'library';
        var FINISHED = 'rdio_finished';
        
        var albumLibrary = null;
        
        // Set the raw token
        this.setToken = function(token){
            // Store the response
            localStorageService.set(TOKEN, token);
        }
        
        // This will return the raw token
        this.getToken = function(){
            var result = localStorageService.get(TOKEN);
            if(!result) return null;
            
            return result;
        }
        
        // This will return just the access token
        this.getAccessToken = function(){
            // Using the token
            // http://www.rdio.com/developers/docs/web-service/oauth2/overview/ref-oauth2-access-token
            var result = this.getToken();
            if(!result) return null;
            
            return result.access_token;
        }
        
        // Make sure we have a good token before the request
        this.checkAccessToken = function(){
            var deferred = $q.defer();
            var data = $httpParamSerializer({'method': 'currentUser', 'extras':'albumCount,trackCount'});
            var params = {
                'headers': {
                    'content-type': undefined,
                    'x-rdio-client-id': CLIENT_ID,
                    'Authorization': 'Bearer ' + this.getAccessToken()
                }
            };
                
            // Go get the albums
            $http.post(ENDPOINT_URI + 'currentUser', data, params).then(deferred.resolve, function(response){
                // http://www.rdio.com/developers/docs/web-service/oauth2/overview/ref-using-a-refresh-token
                if(response.data.error == "invalid_token"){
                    this.getRefreshToken().then( function(){
                        // We've got a new token. Try again
                        deferred.resolve();
                    }.bind(this), function(){
                        alert('Error getting refresh token');
                        deferred.reject();
                    }.bind(this));
                }
            }.bind(this));
            
            return deferred.promise;
        }
        
        // Redirect to the auto page
        this.redirectToRdio = function(){
            $window.location.href = OAUTH_URI + '?' + $httpParamSerializer({
                'response_type': 'code',
                'client_id': CLIENT_ID,
                'redirect_uri': REDIRECT_URI,
                'state': 'rdio',
                'hideSignup': true,
                'showSignup': false
            });
        }
        
        // Check to see if the library is avaliable
        this.isLibraryAvaliable = function(){
            var result = localStorageService.get(FINISHED);
            
            return (result && result === true);
        }
        
        // Get the library
        function getLibrary(){
            // If we have something return it right away
            if(albumLibrary) return albumLibrary;
            
            // If it's null check local storage first
            if(!albumLibrary && localStorageService.get(LIBRARY)){
                albumLibrary = localStorageService.get(LIBRARY);
            }
            // Return the default
            else{
                albumLibrary = {'total': 0, 'albums':[]}
            }
            
            return albumLibrary;
        }
        this.getLibrary = getLibrary;
        
        // Save the library
        function saveLibrary(){
            // Store the results
            localStorageService.set(LIBRARY, albumLibrary);
        }
        this.saveLibrary = saveLibrary;
        
        // Go get the albums
        this.getAlbums = function(reset){
            var size = 307; // Make the number prime
            var offset = 0;
            var deferred = $q.defer();
            var albumsToAdd = [];
            
            // All requests are POST
            // http://www.rdio.com/developers/docs/web-service/overview/
            function getAlbums(off, sz){
                var data = $httpParamSerializer({'method': 'getFavorites', 'start': off, 'count': sz, 'types':'tracksAndAlbums', 'extras':'-*,name,artist,icon,album,length,upcs,releaseDate'});
                var params = {
                    'headers': {
                        'content-type': undefined,
                        'x-rdio-client-id': CLIENT_ID,
                        'Authorization': 'Bearer ' + this.getAccessToken()
                    }
                };
                
                // Go get the albums
                $http.post(ENDPOINT_URI + 'getFavorites', data, params).then( function(response){
                    var albums = response.data.result;
                    var albumCache = {};
                    var finalAlbumList = [];
                    
                    // Save the results
                    albumsToAdd = albumsToAdd.concat(albums);
                    
                    // Check to see if we need to run again
                    if(albums.length == sz){
                        getAlbums.call(this, off + sz, sz);
                    }
                    else{
                        albumLibrary.total = 0;
                        
                        // Look through the incoming albums
                        albumsToAdd.forEach( function(album){
                            // Skip the album if we've added it
                            if(albumCache[sprintf('%s|%s', album.artist.trim(), album.name.trim())]) return;
                            
                            // Record the album
                            albumCache[sprintf('%s|%s', album.artist.trim(), album.name.trim())] = true;
                            finalAlbumList.push(album);
                            
                            // Update the total
                            albumLibrary.total++;
                        });
                        
                        
                        // Append the albums in the reverse order
                        albumLibrary.albums = finalAlbumList.reverse();
                        
                        saveLibrary();
                        
                        localStorageService.set(FINISHED, true);
                        
                        // Cache cleanup
                        deferred.resolve();
                    }
                    
                }.bind(this), deferred.reject);
            }
            
            this.checkAccessToken().then(function(){
                getAlbums.call(this, offset, size);
            }.bind(this));
            
            return deferred.promise;
        }
        
        // Get a refresh token
        this.getRefreshToken = function(){
            var deferred = $q.defer();
            
            // Get a new token
            $http.post('api.php', {'client':'rdio', 'task': 'refresh_token', 'clientId':CLIENT_ID, 'refresh_token':this.getToken().refresh_token}).then( function(response){
                // Set the new token here
                this.setToken(response.data);
                deferred.resolve();
            }.bind(this), function(response){
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
            if(results['state'] && results['state'] === 'rdio' && results['code']){
                code = results['code'];
                // Clean the code and the scope from the URI
                $location.url('');
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
                deferred.reject();
            });
            
            return deferred.promise;
        }
    }
})();