(function(){
    MoveToSpotify.directive('rdio', Rdio);
    
    Rdio.$inject = [RDIO_SERVICE, '$log'];
    
    function Rdio(Service, $log){
        
        // Go get the code
        function goToRdio(){
            Service.redirectToRdio();
        }
        
        // Get the list of albums
        function getAlbums($event){
            // Update button
            $event.target.disabled = true;
            $event.target.innerText = "Getting albums. Please wait.";
            
            // Go get albums
            Service.getAlbums().then(function(result){
                this.getLibrary = true;
                this.connect = false;
                
            }.bind(this))['finally']( function(){
                $event.target.disabled = false;
                $event.target.innerText = this.GET_RDIO_LIB;
            }.bind(this));
        }
        
        // Check to see if we've made a connection to rdio
        function checkStatus(){
            Service.checkStatus().then(function(){
                // Allow the user to get the library again
                this.getLibrary = true;
            }.bind(this), function(){
                // We don't have a token yet
                this.connect = true;
            }.bind(this));
        }
        
        function getAlbumCount(){
            return Service.getLibrary().total;
        }
        
        function getTrackCount(){
            var result = Service.getLibrary();
            var trackCount = 0;
            
            // Get track count
            result.albums.forEach(function(album){
                trackCount += album.length;
            });
            
            return trackCount;
        }
        
        function controller($scope){
            this.checkStatus = checkStatus;
            this.goToRdio = goToRdio;
            this.getAlbums = getAlbums;
            this.getAlbumCount = getAlbumCount;
            this.getTrackCount = getTrackCount;
            this.connect = false;
            this.getLibrary = false;
            
            this.GET_RDIO_LIB = "Get Rdio Albums";
            
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