'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});

//app.service('srcCode', function($q) {
//	  var d = $q.defer();
//	  var getData = $http({
//		  url: '/pc/osc.js',
//		  method: 'GET',
//		  transformResponse: appendTransform($http.defaults.transformResponse, function(value) {
//		    return doTransform(value);
//		  })
//		});
//	  
//	  this.botCode = function() {
//	    fs.readFile('tags', 'utf8', function(err, data) {
//	      if (err) throw err;
//	      console.debug(data.split(','));
//	      d.resolve(data.split(','));
//	    });
//	    return d.promise();
//	  };    
//	});


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

        sendBotCode: function (data) {
            return $http.post('/pc', data).then(function (response) {
                return response.data;
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
	botCodeFactory.getBotCode().then(function(data){ console.log(data); $scope.string = data;});
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