(function(){
    MoveToSpotify.directive('rdio', Rdio);
    
    Rdio.$inject = ['$rootScope', RDIO_SERVICE, '$log'];
    
    function Rdio($rootScope, RdioService, $log){
        
        // Go get the code
        function goToRdio(){
            RdioService.redirectToRdio();
        }
        
        // Get the list of albums
        function getAlbums($event){
            // Update button
            $event.target.disabled = true;
            $event.target.innerText = "Getting albums. Please wait.";
            
            // Go get albums
            RdioService.getAlbums().then(function(result){
                this.getLibrary = true;
                this.connect = false;
                
            }.bind(this))['finally']( function(){
                $event.target.disabled = false;
                $event.target.innerText = this.GET_RDIO_LIB;
            }.bind(this));
        }
        
        // Check to see if we've made a connection to rdio
        function checkStatus(){
            RdioService.checkStatus().then(function(){
                // Allow the user to get the library again
                this.getLibrary = true;
            }.bind(this), function(){
                // We don't have a token yet
                this.connect = true;
            }.bind(this));
        }
        
        function getAlbumCount(){
            return RdioService.getLibrary().total;
        }
        
        function getTrackCount(){
            var result = RdioService.getLibrary();
            var trackCount = 0;
            
            // Get track count
            result.albums.forEach(function(album){
                trackCount += album.length;
            });
            
            return trackCount;
        }
        
        function setOrder(order){
            RdioService.setOrder(order);
            $rootScope.$broadcast(REFRESH_LIBRARY);
        }
        
        function getOrder(){
            return RdioService.getOrder();
        }
        
        function resetLibrary(){
            RdioService.resetLibrary();
            RdioService.saveLibrary();
        }
        
        function controller($scope){
            this.checkStatus = checkStatus;
            this.goToRdio = goToRdio;
            this.getAlbums = getAlbums;
            this.getAlbumCount = getAlbumCount;
            this.getTrackCount = getTrackCount;
            this.resetLibrary = resetLibrary;
            this.setOrder = setOrder;
            this.getOrder = getOrder;
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