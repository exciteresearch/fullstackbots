'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});

app.controller('PlayCanvasCtrl',function($scope,$sce){
	//playCanvas URL can be changed to anything including /pc/index.html or http://playcanv.as/p/aP0oxhUr
	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html');
});

app.controller('CodeEditorCtrl',function($scope,$sce){
	//Could also be a Panel of Tabs
	
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