(function(){
    MoveToSpotify.directive('library', Library);
    
    Library.$inject = ['$rootScope', LIBRARY_SERVICE, '$timeout','$log'];
    
    function Library($rootScope, LibraryService, $timeout, $log){
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
        function save(){
            // Update the library
            LibraryService.saveLibrary();
        }
        
        function controller($scope){
            this.save = save;
            this.albums = LibraryService.getLibrary;
            this.loadArtwork = loadArtwork;
            
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