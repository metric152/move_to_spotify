(function(){
    MoveToSpotify.directive('rdio', Rdio);
    
    Rdio.$inject = ['$rootScope', '$sce', RDIO_SERVICE, LIBRARY_SERVICE, '$log'];
    
    function Rdio($rootScope, $sce, RdioService, LibraryService, $log){
        var GET_RDIO_LIB = "Get Rdio Albums";
        
        // Go get the code
        function goToRdio(){
            RdioService.redirectToRdio();
        }
        
        // Get the list of albums
        function getAlbums($event){
            // Update button
            $event.target.disabled = true;
            this.btnTxt = "Getting albums. Please wait <i class='fa fa-spinner fa-pulse'></i>";
            
            // Go get albums
            RdioService.getAlbums().then(function(result){
                this.getLibrary = true;
                this.connect = false;
                
            }.bind(this))['finally']( function(){
                $event.target.disabled = false;
                this.btnTxt = GET_RDIO_LIB;
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
            return LibraryService.getLibrary().total;
        }
        
        function getTrackCount(){
            var result = LibraryService.getLibrary();
            var trackCount = 0;
            
            // Get track count
            result.albums.forEach(function(album){
                trackCount += album.length;
            });
            
            return trackCount;
        }
        
        function setOrder(order){
            LibraryService.setOrder(order);
            $rootScope.$broadcast(REFRESH_LIBRARY);
        }
        
        function getOrder(){
            return LibraryService.getOrder();
        }
        
        function resetLibrary(){
            LibraryService.resetLibrary();
            LibraryService.saveLibrary();
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
            
            this.btnTxt = GET_RDIO_LIB;
            
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