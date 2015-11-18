(function(){
	MoveToSpotify.directive('rdio', Rdio);
	
	Rdio.$inject = ['$log'];
	
	function Rdio($log){
		
		function controller($scope){
			$log.debug('rdio up');
		}
		
		return {
			'templateUrl': 'js/app/rdio/rdio.html',
			'restrict':'E',
			'scope':{},
			'controller':['$scope', controller],
			'controllerAs': 'rdio',
			'bindToController': true
		} 
	} 
})();