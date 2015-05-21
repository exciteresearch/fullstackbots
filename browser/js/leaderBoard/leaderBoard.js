'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('leaderBoard', {
        url: '/leaderBoard',
        controller: "LeaderBoardController",
        templateUrl: 'js/leaderBoard/leaderBoard.html'
        ,
        data: {
            authenticate: true
        }
    });
});

app.controller('LeaderBoardController', function ($scope, $stateParams, AuthService, LeaderBoardFactory, ChallengeFactory) {
    
	if (!$scope.user) AuthService.getLoggedInUser().then(function (user) {
        $scope.user = user;
    });

    if (!$scope.userRank) LeaderBoardFactory.getUserRank().then(function(users){
        $scope.userRank = users;
    });

    if (!$scope.botRank) LeaderBoardFactory.getBotRank().then(function(bots){
        $scope.botRank = bots;
    });


	// //SCOPE METHODS
	$scope.challengeUser = function( user ) {
		if ($scope.user._id !== user._id)
        ChallengeFactory.challengeUser( $scope.user._id, 
        	{ challenged: user._id } );
    }
   
   $scope.forkBot = function( index ) {
        //Factory.forkBot( $scope.botRank[index] );
    }
  
});
