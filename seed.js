/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

Refer to the q documentation for why and how q.invoke is used.

*/

var mongoose = require('mongoose');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Bot = mongoose.model('Bot');
var q = require('q');
var chalk = require('chalk');

var getCurrentUserData = function () {
    return q.ninvoke(User, 'find', {});
};

var seedUsers = function () {
	
    var users = [
        {
            email: 'gwb@gmail.com',
            password: 'pass',
            username: "GWB"
        },
        {
            email: 'obama@gmail.com',
            password: 'pass',
            username: "POTUS"
        }
    ];

    return q.invoke(User, 'create', users);

};

var seedBots = function () {

var userIDs= [];
return User.findOne({email:'gwb@gmail.com'}).exec()
.then(function(user) {
    userIDs.push(user._id);
    return userIDs;
})
.then(function(userIDs) {
    return User.findOne({email:'obama@gmail.com'}).exec()
})
.then(function(user) {
    userIDs.push(user._id);
    return userIDs;
})
.then(function(userIDs){
    var bots = [
        {
        	codedBy: userIDs[0],
        	botname: "SFAQL",
        	botCode: "this.goTowards( this.tankPosition, [24, 24] );"
        },
        {
        	codedBy: userIDs[1],
        	botname: "potusBot",
        	botCode: "//TankAI 8:24PM 5/15/2015\r\nvar _self = this.entity.script.client;\r\neasystar.setGrid(twoDimensionalArray);\r\neasystar.setAcceptableTiles([0]);\r\neasystar.enableDiagonals();\r\n\r\nthis.tankPosition = tankPosition;\r\nif(newPath===true){\r\n\r\n    newPath=false;\r\n    easystar.findPath(Math.round(tankPosition[0]), Math.round(tankPosition[2]), destinationX, destinationY, function( path ) { //destinationX, destinationY\r\n        if (path === null) {\r\n            console.log(\"Path was not found.\");\r\n        } else {\r\n            myPath=path;\r\n             console.log(currentPriority);\r\n        }\r\n    });\r\n    easystar.calculate();\r\n    destination=true;\r\n}\r\n\r\nthis.pastLocations.push(tankPosition[0])\r\nthis.pastLocations.push(tankPosition[2])\r\nif(this.pastLocations.length>40){\r\n    this.pastLocations.shift()\r\n    this.pastLocations.shift()\r\n}\r\nif(this.unstick>0){\r\n    this.unstick--\r\n}else{\r\n    if(Math.abs(this.pastLocations[0]-this.pastLocations[38])+Math.abs(this.pastLocations[1]-this.pastLocations[39])<0.5){\r\n        this.movementOne=Math.round(Math.random()*2-1)\r\n        this.movementTwo=Math.round(Math.random()*2-1)\r\n        this.unstick=100;\r\n    }else{\r\n        if (l>myPath.length-2){\r\n           destination=false;\r\n           l=0;\r\n           currentPriority=0;\r\n        }\r\n        if(destination===true&&myPath.length>0){\r\n\r\n            if (Math.abs(tankPosition[0]-(myPath[l].x))+Math.abs(tankPosition[2]-(myPath[l].y))<1){ \r\n\r\n                l++; \r\n            }\r\n            if (tankPosition[0]<myPath[l].x&&tankPosition[2]>myPath[l].y){\r\n               this.movementOne=1\r\n                this.movementTwo=(((Math.abs(tankPosition[2]-myPath[l].y)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*-2)+1)\r\n\r\n            }\r\n            if (tankPosition[0]>myPath[l].x&&tankPosition[2]<myPath[l].y){\r\n                this.movementOne=-1\r\n                this.movementTwo=(((Math.abs(tankPosition[2]-myPath[l].y)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*2)-1)\r\n            }\r\n            if(tankPosition[0]>myPath[l].x&&tankPosition[2]>myPath[l].y){\r\n               this.movementTwo=-1\r\n               this.movementOne=(((Math.abs(tankPosition[0]-myPath[l].x)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*-2)+1)\r\n\r\n            }\r\n            if(tankPosition[0]<myPath[l].x&&tankPosition[2]<myPath[l].y){\r\n               this.movementTwo=1\r\n               this.movementOne=(((Math.abs(tankPosition[0]-myPath[l].x)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*2)-1)\r\n            }\r\n        }else{\r\n        \r\n            if (! this.connected)\r\n                return;\r\n            //ian edit: Motion script\r\n\r\n            if(shootNow===true){\r\n            \r\n            }else{\r\n             this.shoot(false);   \r\n            }\r\n            if (this.moved===undefined){\r\n                this.moved=0;\r\n            }\r\n            if(this.braked===true){\r\n                this.moved=200;\r\n            }\r\n        }\r\n        if(this.moved%200===0||this.moved===0){\r\n        this.movementOne=Math.round(Math.random()*2-1)\r\n        this.movementTwo=Math.round(Math.random()*2-1)\r\n        while(this.movementOne===0 && this.movementTwo===0){\r\n            this.movementOne=Math.round(Math.random()*2-1)\r\n            this.movementTwo=Math.round(Math.random()*2-1)\r\n            }\r\n        }\r\n    }\r\n}  \r\nif(shootNow===\"right\"){\r\n    if(this.angle>-180){\r\n        this.angle-=3\r\n    }else{\r\n        this.angle=180;\r\n    } \r\n}else if(shootNow===\"left\"){\r\n    if (this.angle<180){\r\n        this.angle+=3\r\n    }else{\r\n        this.angle=-180;\r\n    }\r\n}        \r\n\r\n\r\nthis.entity.script.tanks.own.targeting(this.angle);\r\nif(this.angle<=0){\r\n    var neg=(this.angle+180)\r\n}else{\r\n    var neg=(this.angle-180)\r\n}\r\n_self.socket.send('target', neg);\r\nif(shootNow==true||shootNow==false){\r\n    _self.socket.send('shoot', shootNow);\r\n}   \r\nmovement=[this.movementOne,this.movementTwo];\r\n\r\nthis.moved++;\r\n\r\n// rotate vector\r\nvar t =       movement[0] * Math.sin(Math.PI * 0.75) - movement[1] * Math.cos(Math.PI * 0.75);\r\nmovement[1] = movement[1] * Math.sin(Math.PI * 0.75) + movement[0] * Math.cos(Math.PI * 0.75);\r\nmovement[0] = t;\r\n\r\n// check if it is changed\r\nif (movement[0] !== this.movement[0] || movement[1] != this.movement[1]) {\r\n    this.movement = movement;\r\n    _self.socket.send('move', this.movement);\r\n}",
        }
    ];
    return q.invoke(Bot, 'create', bots);
    });

};

connectToDb.then(function () {
    getCurrentUserData().then(function (users) {
        if (users.length === 0) {
            return seedUsers();
        } else {
            console.log(chalk.magenta('Seems to already be user data, exiting!'));
            process.kill(0);
        }
    }).then(function () {
    	console.log(chalk.green('Seeding bots!'));
        return seedBots();
    }).then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
});