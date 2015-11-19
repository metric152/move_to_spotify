(function(){
	MoveToSpotify.directive('rdio', Rdio);
	
	Rdio.$inject = ['rdioService', '$log'];
	
	function Rdio(Service, $log){
		
		// Go get the code
		function goToRdio(){
			Service.redirectToRdio();
		}
		
		// Check to see if we've made a connection to rdio
		function checkStatus(){
			Service.checkStatus().then(function(){
				// Allow the user to get their album library
				this.getLibrary = true;
			}.bind(this), function(){
				// We don't have a token yet
				this.getLibrary = false;
			}.bind(this));
		}
		
		
		function controller($scope){
			this.checkStatus = checkStatus;
			this.goToRdio = goToRdio;
			this.getLibrary = false;
			
			this.checkStatus();
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