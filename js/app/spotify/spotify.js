(function(){
	MoveToSpotify.directive('spotify', Spotify);
	
	Spotify.$inject = [SPOTIFY_SERVICE, '$log'];
	
	function Spotify(Service, $log){
		
		function controller($scope){
			Service.checkStatus();
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