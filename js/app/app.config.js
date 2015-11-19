(function(){
	MoveToSpotify.config(Configure);
	
	Configure.$inject = ['$locationProvider'];
	
	function Configure($locationProvider){
		// This allows $location to look at the URI
		$locationProvider.html5Mode({
			'enabled': true,
			'requireBase': false
		});
	}
})();