'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('events', {
        url: '/events',
        controller: "EventsController",
        templateUrl: 'js/events/events.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('EventsController', function ($scope, $stateParams, EventsFactory) {

    $scope.data = {
        preferences: "",
        slots: 1,
        createEvent: false
    };
    
    $scope.eventLaunched = false;
    $scope.waiting = false;
    if (!$scope.pendingEvents) EventsFactory.getPendingEvents().then(function(events){
        $scope.pendingEvents = events;
    });

    //TODO
	// if (!$scope.liveEvents) EventsFactory.getLiveEvents().then(function(events){
	// 	$scope.liveEvents = events;
	// });
    $scope.liveEvents = [];

    //TODO
    // if (!$scope.challenges) EventsFactory.getPendingChallenges().then(function(challenges){
    //     $scope.challenges = challenges;
    // });
    $scope.challenges = [];

	
	// //SCOPE METHODS
    $scope.createNewEvent = function() {

        var newEvent = { 
            preferences: $scope.data.preferences,
            slots: $scope.data.slots
        }

        EventsFactory.createEvent( newEvent )
        .then( function ( event )
            {
                console.log("EVENT ADDED!");
                $scope.pendingEvents.push(event);
                $scope.data.createEvent = false;
                $scope.data.preferences = "";
                $scope.data.slots = 1;
            });
    }

    $scope.deleteEvent = function( index ) {
        EventsFactory.deleteEvent( $scope.pendingEvents[index] )
        .then( function (event)
            {
                $scope.pendingEvents.splice(index, 1);
            });
    }

    $scope.joinEvent = function( index ) {
        if($scope.eventLaunched) {
        	console.log("toggle from",$scope.eventLaunched);
        	$scope.eventLaunched = false;
        }
        else {
        	console.log("toggle from",$scope.eventLaunched);
        	$scope.eventLaunched = true;        	
        }
//        EventsFactory.joinEvent( $scope.pendingEvents[index] )
//        .then(function (event) {
//        	$scope.waiting = true;
//            $scope.eventLaunched = true;
//        }).catch(function(err){
//            	console.log(err);
//        });
    }
});

// app.filter('rankFilter', function () {

//   return function ( events, number ) {
//     var filtered = [];
//     for (var i = 0; i < events.length; i++) {
//       if ( events[i].rank<= number ) {
//         filtered.push( events[i] );
//       }
//     }
//     return filtered;
//   };
// });