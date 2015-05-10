'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});

app.factory('botCodeFactory', function ($http) {
    return {
        getBotCode: function () {
            var queryParams = {};
//            if (category) {
//                queryParams.category = category;
//            }
            return $http.get('/pc/osc.js', {
                params: queryParams
            }).then(function (response) {
                return response.data;
            });
        },

        saveBotCode: function (data) {
        	console.log("saveBotCode data",data);
        	var temp = data;

        	data = {
        			botCode: temp,
        			fileName: "osc.js",
        			filePath: "/pc/"
        	};

            return $http.post('/api/saveBotCode/', data).then(function(res) {
//                update.currentOrder = res.data;
//                update.justOrdered = true;
            	console.log("res.data",res.data);
                return res.data;
              }, function(err) {
                  throw new Error(err);
              });
                        
        }
    };
});

app.controller('PlayCanvasCtrl',function($scope,$sce){
/*	//playCanvas URL can be changed to anything including:
 * FullStackBots: /pc/index.html ,
 * Tanx: http://playcanv.as/p/aP0oxhUr ,
 * Voyager: http://playcanv.as/p/MmS7rx1i ,
 * Swoop: http://playcanv.as/p/JtL2iqIH ,
 * Hack: http://playcanv.as/p/KRE8VnRm 
*/	
	$scope.playCanvasURL = $sce.trustAsResourceUrl('http://playcanv.as/p/KRE8VnRm');
});

app.controller('CodeEditorCtrl',function($scope, botCodeFactory){
	//Could also be a Panel of Tabs
	$scope.string = "";
	botCodeFactory.getBotCode()
					.then(function(data){
						$scope.string = data;
		});
	$scope.saveCode = function(){
		botCodeFactory.saveBotCode($scope.string);		
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
        console.log("source",source);
        // creat an eventHandler for when a message is received
        source.addEventListener('open', function(event) {
        	console.log("open",event);
        });
        source.addEventListener('message', function(event) {
        	console.log("message",event);
        	$scope.msg = JSON.parse(event.data);
            $scope.$apply();
            console.log($scope.msg);
        });
        source.addEventListener('error', function(event) {
        	console.log("error",event);
        });
    } else {
	    // Sorry! No server-sent events support..
	    console.log('SSE not supported by browser.');
	}
});