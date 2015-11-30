(function(){
    MoveToSpotify.directive('spotify', Spotify);
    
    Spotify.$inject = ['$rootScope', SPOTIFY_SERVICE, LIBRARY_SERVICE, NOTIFICATION_SERVICE, '$log'];
    
    function Spotify($rootScope, SpotifyService, LibraryService, NotificationService, $log){
        var libInfo = null;
        
        var SEARCH_SPOTIFY = 'Search for Albums <i class="fa fa-search"></i>';
        var SAVE_SPOTIFY = 'Save Selected Albums <i class="fa fa-upload"></i>';
        var SYNC_LIBRARY = 'Check Library <i class="fa fa-refresh"></i>';
        
        // OAUTH dance with spotify
        function goToSpotify(){
            SpotifyService.redirectToSpotify();
        }
        
        // Search for albums
        function searchSpotify($event){
            // Update the button
            $event.target.disabled = true;
            this.btnTxt = "Searching. Please wait <i class='fa fa-spinner fa-pulse'></i>";
            
            SpotifyService.searchForAlbums().then(NotificationService.success, NotificationService.error)['finally']( function(){
                $event.target.disabled = false;
                this.btnTxt = SEARCH_SPOTIFY;
            }.bind(this));
        }
        
        function saveToSpotify($event){
            // Update the button
            $event.target.disabled = true;
            this.saveBtnTxt = "Saving to Spotify. Please wait <i class='fa fa-spinner fa-pulse'></i>";
            
            SpotifyService.save().then(NotificationService.success, NotificationService.error)['finally']( function(){
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
            return SpotifyService.getLibrary().total;
//            return SpotifyService.getPreflightInfo(true).albums;
        }
        
        function getTrackCount(){
            return SpotifyService.getLibrary().tracks;
//            return SpotifyService.getPreflightInfo(true).tracks;
        }
        
        function select(selected){
            LibraryService.selectAll(selected);
        }
        
        function filterNotFound($event){
            LibraryService.filterNotFound($event.target.checked);
            $rootScope.$broadcast(REFRESH_LIBRARY);
        }
        
        function filterNotAdded($event){
            LibraryService.filterNotAdded($event.target.checked);
            $rootScope.$broadcast(REFRESH_LIBRARY);
        }
        
        function sync($event){
            // Update the button
            $event.target.disabled = true;
            this.syncBtnTxt = "Checking Spotify Library <i class='fa fa-spinner fa-pulse'>";
            
            SpotifyService.getAlbums().then(NotificationService.success, NotificationService.error)['finally'](function(){
                $event.target.disabled = false;
                this.syncBtnTxt = SYNC_LIBRARY;
            }.bind(this));
        }
        
        function controller($scope){
            this.checkStatus = checkStatus;
            this.goToSpotify = goToSpotify
            this.searchSpotify = searchSpotify;
            this.saveToSpotify = saveToSpotify;
            this.getAlbumCount = getAlbumCount;
            this.getTrackCount = getTrackCount;
            this.filterNotFound = filterNotFound;
            this.filterNotAdded = filterNotAdded;
            this.isConnected = SpotifyService.isConnected;
            this.sync = sync;
            this.select = select;
            this.connect = false;
            
            this.btnTxt = SEARCH_SPOTIFY;
            this.saveBtnTxt = SAVE_SPOTIFY;
            this.syncBtnTxt = SYNC_LIBRARY;
            
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