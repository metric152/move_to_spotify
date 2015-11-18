(function(){
	MoveToSpotify.directive('spotify', Spotify);
	
	Spotify.$inject = ['spotifyService', '$log'];
	
	function Spotify(Service, $log){
		
		function controller($scope){
			Service.getAuth();
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