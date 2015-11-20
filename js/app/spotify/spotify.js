(function(){
	MoveToSpotify.directive('spotify', Spotify);
	
	Spotify.$inject = [SPOTIFY_SERVICE, '$log'];
	
	function Spotify(Service, $log){
		
		// OAUTH dance with spotify
		function goToSpotify(){
			Service.redirectToSpotify();
		}
		
		// Search for albums
		function searchSpotify(){
			Service.searchForAlbums().then();
		}
		
		// Check to see if we're ready
		function checkStatus(){
			Service.checkStatus().then(function(){
				// Start the search
				this.search = true;
			}.bind(this), function(){
				// We don't have a token yet
				this.connect = true;
			}.bind(this));
		}
		
		function controller($scope){
			this.checkStatus = checkStatus;
			this.goToSpotify = goToSpotify
			this.searchSpotify = searchSpotify;
			this.connect = false;
			this.search = false;
			
			this.checkStatus();
		}
		
		return {
			'templateUrl': 'js/app/spotify/spotify.html',
			'restrict':'E',
			'scope':{},
			'controller':['$scope', controller],
			'controllerAs': 'spotify',
			'bindToController': true
		} 
	} 
})();