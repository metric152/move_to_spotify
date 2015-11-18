(function(){
	MoveToSpotify.service('rdioService', Service);
	
	Service.$inject = ['$http', '$q', '$log'];
	
	function Service($http, $q, $log){
		var CLIENT_ID = RDIO_CLIENT_ID;
		var CLIENT_SECRET = RDIO_CLIENT_SECRET;
		var REDIRECT_URI = "http://move.152.io";
		
		this.getAuth = function(){
			$log.debug(CLIENT_ID);
			$log.debug(CLIENT_SECRET);
		}
	}
})();