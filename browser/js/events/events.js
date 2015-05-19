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

app.controller('mainEventCtrl',function($scope, $stateParams){
	$scope.eventsObj = {};
	console.log("revised mainEventCtrl");
	$scope.$on('refreshEventObj',function(event, data){
		console.log("mainEventCtrl data=",data);
		$scope.eventsObj = data;
	});
});

app.controller('EventsController', function ($scope, $stateParams, EventsFactory, $rootScope) {

    $scope.data = {
        preferences: "",
        slots: 1,
        createEvent: false
    };
    
    $scope.eventLaunched = false;
    $scope.directEventID = "";
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
        	$scope.directEventID = $scope.pendingEvents[index]._id;
        	$scope.eventLaunched = true;
        	$scope.$emit('refreshEventObj', { 
        		eventID: $scope.pendingEvents[index]._id, eventType: 'pending' 
    			});
        	$scope.$emit('launchEvent',{ 
        		eventID: $scope.pendingEvents[index]._id, eventType: 'pending' 
        	});
        	console.log("EventsController 'launchEvent' $scope.pendingEvents[index]._id id",$scope.pendingEvents[index]._id);
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

app.controller('PlayCanvasCtrl',function($scope,$sce){
	 //playCanvas URL can be changed to anything including:
	 // FullStackBots: /pc/index.html ,
	 // FSB: http://playcanv.as/p/bbMQlNMt?server=fsb,
	 // Tanx: http://playcanv.as/p/aP0oxhUr ,
	 // Voyager: http://playcanv.as/p/MmS7rx1i ,
	 // Swoop: http://playcanv.as/p/JtL2iqIH ,
	 // Hack: http://playcanv.as/p/KRE8VnRm 
		
	// trustAsResourceUrl can be highly insecure if you do not filter for secure URLs
	// it compounds the security risk of malicious code injection from the Code Editor
	
	console.log('$scope.$parent.directEventID',$scope.$parent.directEventID);
	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb&eventID='+$scope.$parent.directEventID);
////	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb&eventID='+'5559f60123b028a5143b6e63');
////	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb');
//
//	$scope.$on('launchEvent',function(event, data){
//		console.log("PlayCanvasCtrl data=",data);
//		$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb&eventID='+data.eventID);
//	});

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