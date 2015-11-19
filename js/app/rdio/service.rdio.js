(function(){
	MoveToSpotify.service('rdioService', Service);
	
	Service.$inject = ['$http', '$q', '$location', '$window', '$httpParamSerializer', '$log'];
	
	function Service($http, $q, $location, $window, $httpParamSerializer, $log){
		// http://www.rdio.com/developers/app/gml3vqymtzeuzcb77nakopz6hu/
		var CLIENT_ID = "gml3vqymtzeuzcb77nakopz6hu";
		var REDIRECT_URI = "http://move.152.io?rdio=done";
		
		var OAUTH_URI = "https://www.rdio.com/oauth2/authorize";
		var TOKEN_URI = "https://services.rdio.com/oauth2/token";
		var ENDPOINT_URI = "https://services.rdio.com/api/1/";
		
		var TOKEN = 'token';
		
		// Redirect to the auto page
		this.redirectToRdio = function(){
			$window.location.href = OAUTH_URI + '?' + $httpParamSerializer({
				'response_type': 'code',
				'client_id': CLIENT_ID,
				'redirect_uri': REDIRECT_URI,
				'hideSignup': true
			});
		}
		
		// Get the token for requests
		this.getToken = function(){
			return localStorage.getItem(JSON.parse(TOKEN));
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
			$http.post('api.php',{'client': 'rdio', 'redirectUri': REDIRECT_URI, 'clientId': CLIENT_ID, 'code': code}).then(function(result){
				// Store the response
				localStorage.setItem(TOKEN, JSON.toString(result.data));
				
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