(function(){
	// Services
	RDIO_SERVICE = 'rdioService';
	
	// Events
	LIBRARY_REFRESH = 'library-refresh';
	
	// Redirect uri
	REDIRECT_URI = "http://move.152.io";
	
	MoveToSpotify.config(Configure);
	
	Configure.$inject = ['$locationProvider'];
	
	function Configure($locationProvider){
		// This allows $location to look at the URI
		$locationProvider.html5Mode({
			'enabled': true,
			'requireBase': false
		});
	}
})();