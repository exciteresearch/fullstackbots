app.factory('ChallengeFactory', function ($http) {

    return {

        challengeUser: function ( user_challenged ) {

            return $http.post('/api/members/challenge', user_challenged ).then(function (response) {
                return response.data;
            });
            
        },

        acceptChallenge: function ( challenge ) {

            return $http.put('/api/members/challenge/'+challenge._id, event )
            .then(function (response) {
                return response.data;
            });

        }
    };
});
