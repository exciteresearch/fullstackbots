'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('userProfile', {
        url: '/userProfile',
        controller: "UserProfileController",
        templateUrl: 'js/userProfile/userProfile.html'
        ,
        data: {
            authenticate: true
        }
    });
});

app.controller('UserProfileController', function ($scope, $stateParams, AuthService, UserProfileFactory, ChallengeFactory) {
    
    if (!$scope.user) AuthService.getLoggedInUser().then(function (user) {
        $scope.user = user;
        ChallengeFactory.getUserChallenges( user._id ).then(function(challenges){
            $scope.userChallenges = challenges;
        });

        UserProfileFactory.getBotList( user._id ).then(function(bots){
            $scope.botList = bots;
        });
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
