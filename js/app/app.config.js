(function(){
	// Services
	RDIO_SERVICE = 'rdioService';
	SPOTIFY_SERVICE = 'spotifyService';
	
	// Events
	LIBRARY_REFRESH = 'library-refresh';
	SPOTIFY_REFRESH = 'spotify-refresh';
	
	// Redirect uri
	REDIRECT_URI = "http://move.152.io";
	
	MoveToSpotify.config(Configure);
	
	Configure.$inject = ['$locationProvider', '$compileProvider'];
	
	function Configure($locationProvider, $compileProvider){
		// This allows $location to look at the URI
		$locationProvider.html5Mode({
			'enabled': true,
			'requireBase': false
		});
		
		// Allow angular to open albums in spotify app
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(spotify):/);
	}
})();