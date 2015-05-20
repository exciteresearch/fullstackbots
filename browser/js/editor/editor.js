'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('editor', {
        url: '/editor',
        templateUrl: 'js/editor/editor.html'
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

app.controller('SideMenuCtrl',function($scope){
	//Chat, Repo, FAQ. etc
	
});

app.controller('msgCtrl',function($scope) {
    if (typeof(EventSource) !== "undefined") {
    	
        // Yes! Server-sent events support!
        var source = new EventSource('/api/dispatcher/');
        source.onopen = function(event) {
        	console.log("open",event);
        };
        // creat an eventHandler for when a message is received
        source.onmessage = function(event) {
        	  console.log('messaage data:',event.data);
        	  $scope.msg = JSON.parse(event.data);
//            $scope.$apply();
//            console.log($scope.msg);
        };
        source.onerror = function(event) {
        	console.log("error",event);
        };
    } else {
	    // Sorry! No server-sent events support..
	    console.log('SSE not supported by browser.');
	}
});