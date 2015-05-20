'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('userProfile', {
        url: '/userProfile',
        controller: "UserProfileController",
        templateUrl: 'js/userProfile/userProfile.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('UserProfileController', function ($scope, $stateParams, $UserProfileFactory, $ChallengeFactory) {
    
    if (!$scope.userChallenges) ChallengeFactory.getUserChallenges().then(function(challenges){
        $scope.userChallenges = challenges;
    });

    if (!$scope.botList) UserProfileFactory.getBotList().then(function(bots){
        $scope.botList = bots;
    });


	// //SCOPE METHODS
    $scope.acceptChallenge = function( index ) {
        ChallengeFactory.acceptChallenge( $scope.challenges[index] );
    }
     
    $scope.deleteBot = function( index ) {
        UserProfileFactory.deleteBot( $scope.botList[index] ).then(function( bot ){
        $scope.botList.splice(index, 1);
    });;
    }   
  
});
