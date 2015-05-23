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
});

app.controller('mainEditorCtrl',function($scope, $stateParams){
	$scope.eventsObj = {};
	$scope.$on('refreshEventObj',function(event, data){
		$scope.eventsObj = data;
	});
});

app.controller('PlayCanvasEditorCtrl',function($scope, $stateParams, $sce,uuid4){

	$scope.simLaunched = false;
	
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

	$scope.bot = {};
	
	//Could also be a Panel of Tabs, TODO upon selection or forking of a bot
	BotCodeFactory.getBot($stateParams.defaultBotID).then(function(bot){
		$scope.bot = bot;
//		$scope.bot.botCode = bot.botCode;
//		$scope.bot._id = bot._id;

	});

	
	
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
