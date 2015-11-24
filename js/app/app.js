(function(){
    MoveToSpotify = angular.module('MoveToSpotify', ['LocalStorageModule']);
    
    MoveToSpotify.run(runConfig);
    MoveToSpotify.$inject = [];
    
    function runConfig(){
    }
})();