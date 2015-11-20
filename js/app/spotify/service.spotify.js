(function(){
	MoveToSpotify.service(SPOTIFY_SERVICE, Service);
	
	Service.$inject = ['$rootScope', '$http', '$q', '$location', '$window', '$httpParamSerializer', '$timeout', 'localStorageService', RDIO_SERVICE, '$log'];
	
	function Service($rootScope, $http, $q, $location, $window, $httpParamSerializer, $timeout, localStorageService, RdioService, $log){
		// https://developer.spotify.com/my-applications/#!/applications/2c2bff3442994bba939ef3fd04e0efce
		var CLIENT_ID = "2c2bff3442994bba939ef3fd04e0efce";
		
		var OAUTH_URI = "https://accounts.spotify.com/authorize";
		var ENDPOINT_URI = "https://api.spotify.com/";
		
		var TOKEN = 'spotify_token';
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
				'state': 'spotify'
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
		
		// Search for albums
		this.searchForAlbums = function(){
			var deferred = $q.defer();
			var library = RdioService.getLibrary();
			
			function search(artist, album){
				var params = {
					'params':{
						'type':'album',
						'q': sprintf('album:%s artist:%s', album, artist)
					},
					'headers':{
						'Authorization': 'Bearer ' + this.getAccessToken()
					}
				};
				
				$http.get(ENDPOINT_URI + 'v1/search', params).then(function(response){
					$log.debug(response);
				}.bind(this), function(response){
					$log.debug(response);
					
					//  Check for expired token
					if(response.data.error.message.indexOf("token expired") > -1){
						this.getRefreshToken().then(function(response){
							search.call(this, artist, album);
						}.bind(this), function(response){
							alert('Issue getting refresh token');
							deferred.reject();
						}.bind(this));
					}
				}.bind(this));
			}
			
			search.call(this, library['albums'][0]['artist'], library['albums'][0]['name']);
			
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
			if(results['state'] && results['state'] === 'spotify'){
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