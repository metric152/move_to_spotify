(function(){
	LIBRARY_REFRESH = 'library-refresh';
	
	MoveToSpotify.directive('library', Library);
	
	Library.$inject = [RDIO_SERVICE, '$log'];
	
	function Library(Service, $log){
		
		function controller($scope){
			var result = Service.getLibrary();
			this.albums = result.albums;
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