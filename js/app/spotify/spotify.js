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
			$event.target.innerText = 'Searching Spotify. Please wait.';
			
			SpotifyService.searchForAlbums().then(function(){
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
			    
			    // Check to see if we've searched
			    if(SpotifyService.isSearched()){
			        this.save = true;
			    }
			    else{
			        // Start the search
	                this.search = true;
			    }
			}.bind(this), function(){
				// We don't have a token yet
				this.connect = true;
			}.bind(this));
		}
		
		function updateDisplay(){
		    var result = RdioService.getLibrary();
		    if(!result) return;
		    
		    this.albumCount = 0;
		    this.trackCount = 0;
		    
		    result.albums.forEach( function(album, index){
		        if(album.spotifyAlbumId && !album.hasOwnProperty('selected')){
		            this.albumCount++;
		            this.trackCount += album.length;
		        }
		    }.bind(this));
		}
		
		function isSaveDisabled(){
		    this.warn = this.trackCount > 9900;
		    
		    return this.warn;
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
			this.isSaveDisabled = isSaveDisabled;
			this.getAlbumCount = getAlbumCount;
			this.getTrackCount = getTrackCount;
			this.select = select;
			this.connect = false;
			this.search = false;
			this.save = false;
			this.warn = false;
			
			this.updateDisplay = updateDisplay;
			
			
			this.SEARCH_SPOTIFY = "Search Spotify for Albums";
			this.SAVE_SPOTIFY = "Save to Spotify";
			
			this.checkStatus();
//			this.updateDisplay();
			
//			$rootScope.$on(SPOTIFY_REFRESH, this.updateDisplay.bind(this));
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