(function(){
	MoveToSpotify.directive('library', Library);
	
	Library.$inject = ['$rootScope', RDIO_SERVICE, '$timeout','$log'];
	
	function Library($rootScope, Service, $timeout, $log){
		
		// Listen for the last element to be drawn then run the plugin
		function loadArtwork($last){
			if(!$last) return;
			
			$timeout(function(){
				// Set up image lazy load
				// Give the img an alt tag so it has some dimensions and will load properly
				var bLazy = new Blazy({
					'container': '#rdio-library',
					'src': 'data-blazy'
				});
			}, 1000);
		}
		
		// Add or remove the album from export
		function include($event, $index, album){
			if(!$event.target.checked){
				album.selected = false;
			}
			else{
				delete album['selected'];
			}
			// Update the library
			Service.updateLibrary(album, $index);
			
			// Update spotify count
			$rootScope.$broadcast(SPOTIFY_REFRESH);
		}
		
		// Figure out if the album should be selected
		function selected(album){
			return album.spotifyAlbumId && !album.hasOwnProperty('selected');
		}
		
		function controller($scope){
			this.updateDisplay = updateDisplay;
			this.include = include;
			this.selected = selected;
			this.albums = Service.getLibrary;
			this.loadArtwork = loadArtwork;
		}
		
		return {
			'templateUrl': 'js/app/library/library.html',
			'restrict':'E',
			'scope':{},
			'controller':['$scope', controller],
			'controllerAs': 'lib',
			'bindToController': true
		} 
	} 
})();