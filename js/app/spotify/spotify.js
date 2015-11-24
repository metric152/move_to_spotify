(function(){
	MoveToSpotify.directive('spotify', Spotify);
	
	Spotify.$inject = ['$rootScope', SPOTIFY_SERVICE, RDIO_SERVICE, '$log'];
	
	function Spotify($rootScope, SpotifyService, RdioService, $log){
		var libInfo = null;
		
		// OAUTH dance with spotify
		function goToSpotify(){
			SpotifyService.redirectToSpotify();
		}
		
		// Search for albums
		function searchSpotify($event){
			// Update the button
			$event.target.disabled = true;
			$event.target.innerText = 'Searching. Please wait.';
			
			SpotifyService.searchForAlbums().then(function(){
				
			}.bind(this), function(message){
				if(message) alert(message);
			}.bind(this))['finally']( function(){
			    $event.target.disabled = false;
                $event.target.innerText = this.SEARCH_SPOTIFY;
			}.bind(this));
		}
		
		function saveToSpotify($event){
			// Update the button
			$event.target.disabled = true;
			$event.target.innerText = "Saving to Spotify. Please wait";
			
			SpotifyService.save().then(function(){
				$event.target.innerText = "Albums Saved to Spotify";
			}.bind(this), function(message){
			    alert(message);
				$event.target.innerText = this.SAVE_SPOTIFY;
			}.bind(this))['finally']( function(){
				$event.target.disabled = false;
			}.bind(this));
		}
		
		// Check to see if we're ready
		function checkStatus(){
			SpotifyService.checkStatus().then(function(){
			    
			    
			}.bind(this), function(){
				// We don't have a token yet
				this.connect = true;
			}.bind(this));
		}
		
		function getAlbumCount(){
			return SpotifyService.getPreflightInfo(true).albums;
		}
		
		function getTrackCount(){
			return SpotifyService.getPreflightInfo(true).tracks;
		}
		
		function select(checked){
			RdioService.getLibrary().albums.forEach(function(album){
				album.selected = checked;
			})
			RdioService.saveLibrary();
		}
		
		function controller($scope){
			this.checkStatus = checkStatus;
			this.goToSpotify = goToSpotify
			this.searchSpotify = searchSpotify;
			this.saveToSpotify = saveToSpotify;
			this.getAlbumCount = getAlbumCount;
			this.getTrackCount = getTrackCount;
			this.select = select;
			this.connect = false;
			
			this.SEARCH_SPOTIFY = "Search for Albums";
			this.SAVE_SPOTIFY = "Save Selected Albums";
			
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