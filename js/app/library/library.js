(function(){
	LIBRARY_REFRESH = 'library-refresh';
	
	MoveToSpotify.directive('library', Library);
	
	Library.$inject = ['$log'];
	
	function Library($log){
		
		function controller($scope){
			$log.debug('library up');
		}
		
		return {
			'templateUrl': 'js/app/library/library.html',
			'restrict':'E',
			'scope':{},
			'controller':['$scope', controller],
			'controllerAs': 'library',
			'bindToController': true
		} 
	} 
})();