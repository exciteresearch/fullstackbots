'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});

app.controller('PlayCanvasCtrl',function($scope,$sce){
	//playCanvas URL can be changed to anything including /pc/index.html or http://playcanv.as/p/aP0oxhUr
	$scope.playCanvasURL = $sce.trustAsResourceUrl('http://playcanv.as/p/aP0oxhUr');
});

app.controller('CodeEditorCtrl',function($scope){
	//Could also be a Panel of Tabs
	$scope.string = "pc.script.create('oscillator', function (app) {" + "\n" +
	"\t" + "var Oscillator = function (entity) {" + "\n" +
	"\t" + "\t" + "this.entity = entity;" + "\n" +
	"\t" + "\t" + "this.paused = false; // paused state" + "\n" +
	"\t" + "\t" + "this.amplitude = 10; // The amount to oscillate" + "\n" +
	"\t" + "\t" + "this.time = 0; // The time value for the oscillation" + "\n" +
	"\t" + "};" + "\n" +
	"" + "\n" +
	"\t" + "// define the update function" + "\n" +
	"\t" + "Oscillator.prototype = {" + "\n" +
	"\t" + "\t" + "update: function (dt) {" + "\n" +
	"\t" + "\t" + "// Use the keyboard handler from the Application" + "\n" +
	"\t" + "\t" + "// to pause/unpause" + "\n" +
	"\t" + "\t" + "if (app.keyboard.wasPressed(pc.KEY_SPACE)) {" + "\n" +
	"\t" + "\t" + "\t" + "\t" + "this.paused = !this.paused; // toggle paused state" + "\n" +
	"\t" + "\t" + "}" + "\n" +
	"" + "\n" +
	"\t" + "\t" + "if (!this.paused) {" + "\n" +
	"\t" + "\t" + "// increment the time value by the frametime" + "\n" +
	"\t" + "\t" + 	"\t" + "\t" + "this.time += dt;" + "\n" +
	"" + "\n" +
	"\t" + "\t" + 	"\t" + "\t" + 	"// Calculate the new value" + "\n" +
	"\t" + "\t" + 	"\t" + "\t" + "var x = this.amplitude * Math.sin(this.time*10);" + "\n" +
	"" + "\n" +
	"\t" + "\t" + 	"\t" + "\t" + 	"// Update the x position of the Entity" + "\n" +
	"\t" + "\t" + 	"\t" + "\t" + 	"this.entity.setLocalPosition(x, 0, 0);" + "\n" +
	"\t" + "\t" + 	"}" + "\n" +
	"\t" + "}" + "\n" +
	"};" + "\n" +
	"// return the class definition" + "\n" +
	"return Oscillator;" + "\n" +
	"});";	
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