(function(){
	// Services
	RDIO_SERVICE = 'rdioService';
	SPOTIFY_SERVICE = 'spotifyService';
	
	// Redirect uri
	REDIRECT_URI = "http://move.152.io";
	
	// Rdio Client ID: http://www.rdio.com/developers
	RDIO_CLIENT_ID = "gml3vqymtzeuzcb77nakopz6hu";
	
	// Spotify CLient ID: https://developer.spotify.com/my-applications
	SPOTIFY_CLIENT_ID = "2c2bff3442994bba939ef3fd04e0efce";
	
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