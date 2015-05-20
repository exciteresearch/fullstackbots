'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('editor', {
        url: '/editor',
        templateUrl: 'js/editor/editor.html'
    });
});

app.controller('mainEditorCtrl',function($scope, $stateParams){
	$scope.eventsObj = {};
	console.log("revised mainEventCtrl");
	$scope.$on('refreshEventObj',function(event, data){
		console.log("mainEventCtrl data=",data);
		$scope.eventsObj = data;
	});
});

app.controller('PlayCanvasEditorCtrl',function($scope,$sce,uuid4){

	$scope.simLaunched = false;
	
    $scope.$on('simmulate',function(event, bot) {
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

app.controller('CodeEditorCtrl',function($scope, BotCodeFactory){

	$scope.bot = {};
	
	//Could also be a Panel of Tabs, TODO upon selection or forking of a bot
	BotCodeFactory.getBot('555ba4d6a5f6226b30937fc4').then(function(bot){
		console.log("controller data",bot);
		$scope.bot = bot;
//		$scope.bot.botCode = bot.botCode;
//		$scope.bot._id = bot._id;

	});
	
	$scope.saveBot = function(){
		BotCodeFactory.saveBot($scope.bot);
	};
	
	$scope.simBot = function(){
		BotCodeFactory.saveBot($scope.bot);
		$scope.$emit('simmulate', $scope.bot);
	};
	
	// ui.ace start
	$scope.aceLoaded = function(_editor) {
		// Options
		_editor.setReadOnly(false);
	};
	$scope.aceChanged = function(e) {
		//
	};
	
});

app.controller('CodeConsoleCtrl',function($scope){
	//Code output, console logs, errors etc.
	
});

app.controller('ButtonsCtrl',function($scope){
	//Practice and/or Compete
	
});
