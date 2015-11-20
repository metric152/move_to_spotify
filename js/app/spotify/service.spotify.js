(function(){
	MoveToSpotify.service(SPOTIFY_SERVICE, Service);
	
	Service.$inject = ['$rootScope', '$http', '$q', '$location', '$window', '$httpParamSerializer', '$timeout', 'localStorageService', '$log'];
	
	function Service($rootScope, $http, $q, $location, $window, $httpParamSerializer, $timeout, localStorageService, $log){
		// https://developer.spotify.com/my-applications/#!/applications/2c2bff3442994bba939ef3fd04e0efce
		var CLIENT_ID = "2c2bff3442994bba939ef3fd04e0efce";
		
		var OAUTH_URI = "https://accounts.spotify.com/authorize";
		var ENDPOINT_URI = "";
		
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