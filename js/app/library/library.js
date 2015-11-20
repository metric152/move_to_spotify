(function(){
	LIBRARY_REFRESH = 'library-refresh';
	
	MoveToSpotify.directive('library', Library);
	
	Library.$inject = ['$rootScope', RDIO_SERVICE, '$timeout','$log'];
	
	function Library($rootScope, Service, $timeout, $log){
		
		function updateDisplay(){
			var result = Service.getLibrary();
			this.albums = result.albums;
			
			$timeout(function(){
				// Set up image lazy load
				// Give the img an alt tag so it has some dimensions and will load properly
				var bLazy = new Blazy({
					'container': '#rdio-library',
					'src': 'data-blazy'
				});
			}, 1000);
		}
		
		function controller($scope){
			this.updateDisplay = updateDisplay;
			
			this.updateDisplay();
			
			// Listen for update
			$rootScope.$on(LIBRARY_REFRESH, this.updateDisplay.bind(this));
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