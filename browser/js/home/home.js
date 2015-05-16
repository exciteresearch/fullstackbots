'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});

app.factory('botCodeFactory', function ($http) {
    return {
        getBot: function (bot) {
        	
            var queryParams = {
            		bot: bot
            };
            
            if (!bot) {
            	console.log("no bot");
                return;
            }
            
            return $http.get('/api/dispatcher/readFile/', {
                params: queryParams
            }).then(function (response) {
            	//return to controller
                return response.data;
            });
        },

        saveBot: function (bot) {
//        	if(!bot._id){
//        		bot._id = '5556463aaadfdb33433b63b5';
//        	}
        	
        	var data; //data packet to send
        	data = { bot: bot };

            return $http.post('/api/dispatcher/saveFile/', data).then(function(res) {
//                update.currentOrder = res.data;
//                update.justOrdered = true;
            	console.log('saveFile res.data',res.data);
            	return res.data;
              }, function(err) {
                  throw new Error(err);
              });  
        }

    };
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
	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb');
});

app.controller('CodeEditorCtrl',function($scope, botCodeFactory){

	$scope.bot = {};
	
	//Could also be a Panel of Tabs
	botCodeFactory.getBot('5556463aaadfdb33433b63b5').then(function(bot){
		console.log("controller data",bot);
		$scope.bot.botCode = bot.botCode;
		$scope.bot._id = bot._id;

	});
	
	$scope.saveBot = function(){
		botCodeFactory.saveBot($scope.bot);
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