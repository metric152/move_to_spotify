(function(){
	MoveToSpotify.directive('spotify', Spotify);
	
	Spotify.$inject = [SPOTIFY_SERVICE, '$log'];
	
	function Spotify(Service, $log){
		
		// OAUTH dance with spotify
		function goToSpotify(){
			Service.redirectToSpotify();
		}
		
		// Search for albums
		function searchSpotify($event){
			// Update the button
			$event.target.disabled = true;
			$event.target.innerText = 'Searching Spotify. Please wait.';
			
			Service.searchForAlbums().then(function(){
				// Show the save button
				this.save = true;
				// Turn off search
				this.search = false;
			}.bind(this), function(message){
				if(message) alert(message);
				
				$event.target.disabled = false;
				$event.target.innerText = this.SEARCH_SPOTIFY;
			}.bind(this));
		}
		
		function saveToSpotify($event){
			// Update the button
			$event.target.disabled = true;
			$event.target.innerText = "Saving to Spotify. Please wait";
			
			Service.save().then(function(){
				$event.target.innerText = "Albums Saved to Spotify";
			}.bind(this), function(result){
				$event.target.innerText = this.SAVE_SPOTIFY;
			}.bind(this))['finally']( function(){
				$event.target.disabled = false;
			}.bind(this));
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
			this.saveToSpotify = saveToSpotify;
			this.connect = false;
			this.search = false;
			this.save = false;
			
			this.SEARCH_SPOTIFY = "Search Spotify for Albums";
			this.SAVE_SPOTIFY = "Save to Spotify";
			
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