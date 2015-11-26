(function(){
    MoveToSpotify.directive('spotify', Spotify);
    
    Spotify.$inject = ['$rootScope', SPOTIFY_SERVICE, LIBRARY_SERVICE, '$log'];
    
    function Spotify($rootScope, SpotifyService, LibraryService, $log){
        var libInfo = null;
        
        var SEARCH_SPOTIFY = "Search for Albums";
        var SAVE_SPOTIFY = "Save Selected Albums";
        
        // OAUTH dance with spotify
        function goToSpotify(){
            SpotifyService.redirectToSpotify();
        }
        
        // Search for albums
        function searchSpotify($event){
            // Update the button
            $event.target.disabled = true;
            this.btnTxt = "Searching. Please wait <i class='fa fa-spinner fa-pulse'></i>";
            
            SpotifyService.searchForAlbums().then(alert, alert)['finally']( function(){
                $event.target.disabled = false;
                this.btnTxt = SEARCH_SPOTIFY;
            }.bind(this));
        }
        
        function saveToSpotify($event){
            // Update the button
            $event.target.disabled = true;
            this.saveBtnTxt = "Saving to Spotify. Please wait <i class='fa fa-spinner fa-pulse'></i>";
            
            SpotifyService.save().then(alert, alert)['finally']( function(){
                this.saveBtnTxt = SAVE_SPOTIFY;
                $event.target.disabled = false;
            }.bind(this));
        }
        
        // Check to see if we're ready
        function checkStatus(){
            SpotifyService.checkStatus().then(function(){
                
                
            }.bind(this), function(){
                // We don't have a token yet
                this.connect = true;
            }.bind(this));
        }
        
        function getAlbumCount(){
            return SpotifyService.getPreflightInfo(true).albums;
        }
        
        function getTrackCount(){
            return SpotifyService.getPreflightInfo(true).tracks;
        }
        
        function select($event){
            LibraryService.selectAll($event.target.checked);
        }
        
        function filterNotFound($event){
            LibraryService.filterNotFound($event.target.checked);
            $rootScope.$broadcast(REFRESH_LIBRARY);
        }
        
        function controller($scope){
            this.checkStatus = checkStatus;
            this.goToSpotify = goToSpotify
            this.searchSpotify = searchSpotify;
            this.saveToSpotify = saveToSpotify;
            this.getAlbumCount = getAlbumCount;
            this.getTrackCount = getTrackCount;
            this.filterNotFound = filterNotFound;
            this.select = select;
            this.connect = false;
            
            this.btnTxt = SEARCH_SPOTIFY;
            this.saveBtnTxt = SAVE_SPOTIFY;
            
            this.checkStatus();
        }
        
        return {
            'templateUrl': 'js/app/spotify/spotify.html',
            'restrict':'E',
            'scope':{},
            'controller':['$scope', controller],
            'controllerAs': 'spotify',
            'bindToController': true
        } 
    } 
})();