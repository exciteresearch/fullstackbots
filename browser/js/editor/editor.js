'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('editor', {
        url: '/editor',
        templateUrl: 'js/editor/editor.html'
    })
    .state('editBot',{
		url: '/editor/:defaultBotID',
	    controller: "CodeEditorCtrl",
	    templateUrl: 'js/editor/editor.html'
	    ,
	    data: {
	        authenticate: true
	    }
    })
    .state('forkBotToEditor',{
    	url: '/editor/:defaultBotID',
        controller: "CodeEditorCtrl",
        templateUrl: 'js/editor/editor.html'
        ,
        data: {
            authenticate: true
        }
    });
//    console.log("defaultBotID",defaultBotID);
});

app.controller('mainEditorCtrl',function($scope, $stateParams){
	$scope.editorOn=true;
	$scope.editorToggle = function(){
		$scope.editorOn=!$scope.editorOn;
	};
	$scope.eventsObj = {};
	$scope.$on('refreshEventObj',function(event, data){
		$scope.eventsObj = data;
	});
});

app.controller('SelectBotModalCtrl', function ($scope, $stateParams, AuthService, BotCodeFactory, UserProfileFactory) {
    
    if (!$scope.user) AuthService.getLoggedInUser().then(function (user) {
        $scope.user = user;
        //get bots by user._id only
        UserProfileFactory.getBotList( user._id ).then(function(bots){
            $scope.botList = bots;
        });
    });

	// //SCOPE METHODS
    $scope.selectBot = function( bot ) {
    	console.log("bot",bot);
    	$scope.bot = bot;
//    	$scope.defaultBotID = bot._id;
    	console.log("end of selectBot(bot)");
//       	BotCodeFactory.editBot( $scope.user._id, bot._id );
    };
    $scope.blankBot = function( index ) {
    	console.log('$scope.botList[index]._id',$scope.botList[index]._id);
		BotCodeFactory.getNewBot($scope.botList[index]._id).then(function(bot){
			$scope.bot = bot;
		});
    };
});

app.controller('PlayCanvasEditorCtrl',function($scope, $stateParams, $sce,uuid4){
	$scope.optionsActivated=false;
	$scope.simLaunched = false;
	$scope.options={
		shots:{
			active:false,
			text:"Shots"
		},
		accuracy:{
			active:false,
			text:"Accuracy"
		},
		mines:{
			active:false,
			text:"Mines Layed"
		},
		minesTripped:{
			active:false,
			text:"Mines Tripped"
		},
		coins:{
			active:false,
			text:"Coins"
		},
		kills:{
			active:false,
			text:"Kills"
		},
		deaths:{
			active:false,
			text:"Deaths"
		},
	}
	
    $scope.$on('simulate',function(event, bot) {
    	if(!bot._id) {
        	$scope.simLaunched = false;
        }
        else {
        	var eventID = uuid4.generate();
        	$scope.$emit('refreshEventObj', { 
        		eventID: eventID,
        		botOneID: bot._id
			});
        	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb'
				+'&eventID='+eventID
				+"&botOneID="+bot._id
			);
        	$scope.simLaunched = true;
        }
    });
});

app.controller('CodeEditorCtrl',function($scope, $stateParams, BotCodeFactory, AuthService){

	if (!$scope.user) AuthService.getLoggedInUser().then(function (user) {
        $scope.user = user;
    });

	// BotCodeFactory.createBlankBot( user._id ).then(function(bot){
	// 	$scope.bot = bot;
	// });

	// BotCodeFactory.createForkedBot( user._id, bot._id ).then(function(bot){
	// 	$scope.bot = bot;
	// });

	$scope.bot = $scope.bot || {};
	
	//Could also be a Panel of Tabs, TODO upon selection or forking of a bot
	if ($stateParams.defaultBotID !== undefined){
		BotCodeFactory.getBot($stateParams.defaultBotID).then(function(bot){
			$scope.bot = bot;
		});
	}	
	
	$scope.saveBot = function(){
		BotCodeFactory.saveBot($scope.bot);
	};
	
	$scope.simBot = function(){
		BotCodeFactory.saveBot($scope.bot);
		$scope.$emit('simulate', $scope.bot);
	};
	
	// ui.ace start
	$scope.aceLoaded = function(_editor) {
		// Options
		_editor.setReadOnly(false);
	};
	$scope.aceChanged = function(e) {
		//
	};
	
	$scope.compete = function(){
//		console.log("fire compete")
		BotCodeFactory.compete($scope.bot);
	};
	

});

app.controller('CodeConsoleCtrl',function($scope){
	//Code output, console logs, errors etc.
	
});

app.controller('ButtonsCtrl',function($scope){
	//Practice and/or Compete
	
});
