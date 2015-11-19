(function(){
	MoveToSpotify.directive('rdio', Rdio);
	
	Rdio.$inject = ['$rootScope', 'rdioService', '$log'];
	
	function Rdio($rootScope, Service, $log){
		
		// Go get the code
		function goToRdio(){
			Service.redirectToRdio();
		}
		
		// Get the list of albums
		function getAlbums($event, reset){
			// Update button
			$event.target.disabled = true;
			$event.target.innerText = "Getting albums. Please wait.";
			
			// Go get albums
			Service.getAlbums(reset).then(function(result){
				$log.debug(result);
				this.getLibrary = false;
				this.connect = false;
				this.getAgain = true;
				
				// Update the library listing
				$rootScope.$broadcast(LIBRARY_REFRESH);
			}.bind(this), 
			function(result){
				$log.debug(result);
			}.bind(this));
		}
		
		// Check to see if we've made a connection to rdio
		function checkStatus(){
			Service.checkStatus().then(function(){
				
				// Check to see if we have a library
				if(Service.isLibraryAvaliable()){
					this.getAgain = true;
					
					// Update the library listing
					$rootScope.$broadcast(LIBRARY_REFRESH);
				}
				// Allow the user to get their album library
				else{
					this.getLibrary = true;
				}
				
			}.bind(this), function(){
				// We don't have a token yet
				this.connect = true;
			}.bind(this));
		}
		
		
		function controller($scope){
			this.checkStatus = checkStatus;
			this.goToRdio = goToRdio;
			this.getAlbums = getAlbums;
			this.connect = false;
			this.getLibrary = false;
			this.getAgain = false;
			
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