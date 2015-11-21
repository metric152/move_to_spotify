(function(){
	MoveToSpotify.directive('rdio', Rdio);
	
	Rdio.$inject = ['$rootScope', RDIO_SERVICE, '$log'];
	
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
				
			}.bind(this))['finally']( function(){
				$event.target.disabled = false;
				$event.target.innerText = this.GET_RDIO_LIB;
			}.bind(this));
		}
		
		// Check to see if we've made a connection to rdio
		function checkStatus(){
			Service.checkStatus().then(function(){
				
				// Check to see if we have a library
				if(Service.isLibraryAvaliable()){
					this.getAgain = true;
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
		
		function updateDisplay(){
		    var result = Service.getLibrary();
            if(result){
                this.albumCount = result.total;
                this.trackCount = 0;
                
                // Get track count
                result.albums.forEach( function(album, index){
                    this.trackCount += album.length;
                }.bind(this));
            }
		}
		
		
		function controller($scope){
			this.checkStatus = checkStatus;
			this.goToRdio = goToRdio;
			this.getAlbums = getAlbums;
			this.updateDisplay = updateDisplay;
			this.connect = false;
			this.getLibrary = false;
			this.getAgain = false;
			this.albumCount = 0;
            this.trackCount = 0;
			
			this.GET_RDIO_LIB = "Get Rdio Albums";
			
			this.checkStatus();
			this.updateDisplay();
			
			// Listen for update
            $rootScope.$on(LIBRARY_REFRESH, this.updateDisplay.bind(this));
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