(function(){
	MoveToSpotify.directive('rdio', Rdio);
	
	Rdio.$inject = ['rdioService', '$log'];
	
	function Rdio(Service, $log){
		
		function controller($scope){
			Service.getAuth();
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