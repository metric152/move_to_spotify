(function(){
    MoveToSpotify.service( LIBRARY_SERVICE , Service);
    
    Service.$inject = ['$rootScope', '$http', '$q', '$location', '$window', '$httpParamSerializer', 'localStorageService', '$log'];
    
    function Service($rootScope, $http, $q, $location, $window, $httpParamSerializer, localStorageService, $log){
        var albumLibrary = null;
        
        var LIBRARY = 'library';
        var FINISHED = 'library_ready';
        
        this.setOrder = function(value){
            // Bad value
            if(['new','old'].indexOf(value) == -1) return;
            if(value == this.getOrder()) return;
            var lib = this.getLibrary();
            
            lib.albums = albumLibrary.albums.reverse();
            lib.order = value;
            this.saveLibrary();
        }
        
        this.getOrder = function(){
            var lib = this.getLibrary();
            return lib.order;
        }
        
        this.setLibraryAvailability  = function(value){
            localStorageService.set(FINISHED, value);
        }
        
        // Check to see if the library is available
        this.isLibraryAvaliable = function(){
            var result = localStorageService.get(FINISHED);
            
            return (result && result === true);
        }
        
        // Select all of the albums
        this.selectAll = function(checked){
            this.getLibrary().albums.forEach(function(album){
                if(album.added) return;
                album.selected = checked;
            })
            this.saveLibrary();
        }
        
        // Get the library
        this.getLibrary = function(){
            // If we have something return it right away
            if(albumLibrary) return albumLibrary;
            
            // If it's null check local storage first
            if(!albumLibrary && localStorageService.get(LIBRARY)){
                albumLibrary = localStorageService.get(LIBRARY);
            }
            // Return the default
            else{
                albumLibrary = {'total': 0, 'albums':[], 'order': 'new'}
            }
            
            return albumLibrary;
        }
        
        // Add albums to the library
        this.addAlbumsToLibrary = function(albumsToAdd){
            var lib = this.getLibrary();
            var albumCache = {};
            this.resetLibrary();
            
            // Look through the incoming albums
            albumsToAdd.forEach( function(album){
                // Skip the album if we've added it
                if(albumCache[sprintf('%s|%s', album.artist.trim(), album.name.trim())]) return;
                // If there is no release date it's just one track
                if(!album.releaseDate) return;
                
                // Record the album
                albumCache[sprintf('%s|%s', album.artist.trim(), album.name.trim())] = true;
                lib.albums.push(album);
                
                // Update the total
                lib.total++;
            });
            
            this.saveLibrary();
            
            this.setLibraryAvailability(true);
        }
        
        // Save the library
        this.saveLibrary = function(){
            // Store the results
            localStorageService.set(LIBRARY, albumLibrary);
        }
        
        // Reset the library
        this.resetLibrary = function(){
            var lib = this.getLibrary();
            
            lib.total = 0;
            lib.albums = [];
            lib.order = 'new';
        }
    }
})();

