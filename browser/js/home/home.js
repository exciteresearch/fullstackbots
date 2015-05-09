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
	//playCanvas URL can be changed to anything including /pc/index.html or http://playcanv.as/p/aP0oxhUr
	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html');
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

app.controller('CodeConsoleCtrl',function($scope,$sce){
	//Code output, console logs, errors etc.
	
});

app.controller('ButtonsCtrl',function($scope,$sce){
	//Practice and/or Compete
	
});

app.controller('SideMenuCtrl',function($scope,$sce){
	//Chat, Repo, FAQ. etc
	
});