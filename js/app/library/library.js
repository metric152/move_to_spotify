(function(){
	MoveToSpotify.directive('library', Library);
	
	Library.$inject = ['$rootScope', RDIO_SERVICE, '$timeout','$log'];
	
	function Library($rootScope, Service, $timeout, $log){
		
		// Listen for the last element to be drawn then run the plugin
		function loadArtwork($last){
			if(!$last || !Service.isLibraryAvaliable()) return;
			
			$timeout(function(){
				// Set up image lazy load
				// Give the img an alt tag so it has some dimensions and will load properly
				var bLazy = new Blazy({
					'container': '#rdio-library',
					'src': 'data-blazy'
				});
			}, 2000);
		}
		
		// Add or remove the album from export
		function save(){
			// Update the library
			Service.saveLibrary();
		}
		
		function controller($scope){
			this.save = save;
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