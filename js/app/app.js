(function(){
    MoveToSpotify = angular.module('MoveToSpotify', ['LocalStorageModule', 'ngSanitize']);
    
    MoveToSpotify.run(runConfig);
    MoveToSpotify.$inject = [];
    
    function runConfig(){
    }
})();