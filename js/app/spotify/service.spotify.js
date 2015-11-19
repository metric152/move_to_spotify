(function(){
	MoveToSpotify.service('spotifyService', Service);
	
	Service.$inject = ['$http', '$q', '$log'];
	
	function Service($http, $q, $log){
		// https://developer.spotify.com/my-applications/#!/applications/2c2bff3442994bba939ef3fd04e0efce
		var CLIENT_ID = "2c2bff3442994bba939ef3fd04e0efce";
		var REDIRECT_URI = "http://move.152.io?done=spotify";
		
		this.getAuth = function(){
		}
	}
})();