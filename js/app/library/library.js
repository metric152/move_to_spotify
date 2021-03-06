(function(){
    MoveToSpotify.directive('library', Library);
    
    Library.$inject = ['$rootScope', '$window', LIBRARY_SERVICE, SPOTIFY_SERVICE, NOTIFICATION_SERVICE, '$timeout','$log'];
    
    function Library($rootScope, $window, LibraryService, SpotifyService, NotificationService, $timeout, $log){
        var bLazy = null;
        
        // Listen for the last element to be drawn then run the plugin
        function loadArtwork($last){
            if(!$last || !LibraryService.isLibraryAvaliable()) return;
            
            // Image loading
            if(bLazy){
                // Refresh images
                $timeout(function(){
                    bLazy.revalidate();
                }, 500);
            }
            else{
                $timeout(function(){
                    // Set up image lazy load
                    // Give the img an alt tag so it has some dimensions and will load properly
                    bLazy = new Blazy({
                        'container': '#rdio-library',
                        'src': 'data-blazy'
                    });
                }, 2000);
            }
        }
        
        // Add or remove the album from export
        function save(album){
            if(!album.selected){
                album.selected = true;
            }
            else{
                delete album.selected;
            }
            
            // Update the library
            LibraryService.saveLibrary();
        }
        
        // Add the album right away
        function immediateAdd(album){
            SpotifyService.saveToSpotify(album).then(NotificationService.success, NotificationService.error);
        }
        
        // Create a link that will search for the album in spotify
        function spotifySearch(album){
            return sprintf("spotify:search:%s+%s", window.encodeURIComponent(album.artist), window.encodeURIComponent(album.name));
        }
        
        // Check for a UPC 12 code
        function checkUPC(album){
            var result = false;
            
            album.upcs.forEach(function(upc){
                if(!upc) return;
                if([12].indexOf(upc.length) != -1){
                    album.upc = upc;
                    result = true;
                }
            });
            
            return result;
        }
        
        // Generate a link for the apple album
        function searchApple(album){
            return LibraryService.searchApple(album).then(function(uri){
                // Navigate to the album without a popup
                $window.location.href = uri;
            },NotificationService.error);
        }
        
        function controller($scope){
            this.save = save;
            this.albums = LibraryService.getLibrary;
            this.spotifySearch = spotifySearch;
            this.loadArtwork = loadArtwork;
            this.immediateAdd = immediateAdd;
            this.getFilters = LibraryService.getFilters;
            this.checkUPC = checkUPC;
            this.searchApple = searchApple;
            
            $rootScope.$on(REFRESH_LIBRARY,loadArtwork);
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