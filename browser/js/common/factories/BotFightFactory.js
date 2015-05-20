app.factory('BotFightFactory', function ($scope) {
    return {
        simBot: function (bot) {
    		$scope.$emit('simmulate', $scope.bot);
        },

        competeBot: function (bot) {
        }

    };
});
