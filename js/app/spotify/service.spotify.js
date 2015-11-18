(function(){
	MoveToSpotify.service('spotifyService', Service);
	
	Service.$inject = ['$http', '$q', '$log'];
	
	function Service($http, $q, $log){
		var CLIENT_ID = SPOTIFY_CLIENT_ID;
		var CLIENT_SECRET = SPOTIFY_CLIENT_SECRET;
		var REDIRECT_URI = "http://move.152.io";
		
		this.getAuth = function(){
			$log.debug(CLIENT_ID);
			$log.debug(CLIENT_SECRET);
		}
	}
})();