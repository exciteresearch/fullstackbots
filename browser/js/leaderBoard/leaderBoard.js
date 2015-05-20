'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('leaderBoard', {
        url: '/leaderBoard',
        controller: "LeaderBoardController",
        templateUrl: 'js/leaderBoard/leaderBoard.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('LeaderBoardController', function ($scope, $stateParams, $LeaderBoardFactory, $ChallengeFactory) {
    
    if (!$scope.userRank) LeaderBoardFactory.getUserRank().then(function(users){
        $scope.userRank = users;
    });

    if (!$scope.botRank) LeaderBoardFactory.getBotRank().then(function(bots){
        $scope.botRank = bots;
    });


	// //SCOPE METHODS
    $scope.acceptChallenge = function( index ) {
        ChallengeFactory.challengeUser( $scope.userRank[index] );
    }
     
   $scope.forkBot = function( index ) {
        //ChallengeFactory.acceptChallenge( $scope.challenges[index] );
    }
  
});
