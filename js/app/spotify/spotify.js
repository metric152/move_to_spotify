(function(){
	MoveToSpotify.directive('spotify', Spotify);
	
	Spotify.$inject = ['$log'];
	
	function Spotify($log){
		
		function controller($scope){
			$log.debug('spotify up');
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