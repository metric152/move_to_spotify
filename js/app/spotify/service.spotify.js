(function(){
	MoveToSpotify.service(SPOTIFY_SERVICE, Service);
	
	Service.$inject = ['$rootScope', '$http', '$q', '$location', '$window', '$timeout', '$log'];
	
	function Service($rootScope, $http, $q, $location, $window, $timeout, $log){
		// https://developer.spotify.com/my-applications/#!/applications/2c2bff3442994bba939ef3fd04e0efce
		var CLIENT_ID = "2c2bff3442994bba939ef3fd04e0efce";
		
		var OAUTH_URI = "https://accounts.spotify.com/authorize";
		var ENDPOINT_URI = "";
		
		var TOKEN = 'spotify_token';
		var FINISHED = 'spotify_finished';
		
		// Set the raw token
		this.setToken = function(token){
		}
		
		// Get the raw token
		this.getToken = function(){
			
		}
		
		// Get the access token
		this.getAccessToken = function(){
			// https://developer.spotify.com/web-api/authorization-guide/
		}
		
		// Start the OAUTH dance
		this.redirectToSpotify = function(){

		}
		
		// Get a refresh token
		this.getRefreshToken = function(){

		}
		
		// Check after the redirect for a code to get a token
		this.checkStatus = function(){

		}
	}
})();