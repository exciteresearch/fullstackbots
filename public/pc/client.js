console.log("client.js");

//var eventID = "5559f60123b028a5143b6e63";

var test=false;
var l=0;



pc.script.create('client', function (context) {
    
    var counter=0;
    var tmpVec = new pc.Vec3();
    var uri = new pc.URI(window.location.href);
    var query = uri.getQuery();
    var gamepadNum = query.gamepad;

    var Client = function (entity) {
        this.entity = entity;
        this.id = null;
        this.moved=0;
        this.movement = [ 0, 0 ];
        this.pastLocations=[]
        context.keyboard = new pc.input.Keyboard(document.body);
        
        document.body.style.cursor = 'none';
    };
    var getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    Client.prototype = {
        initialize: function () {
            this.tanks = context.root.getChildren()[0].script.tanks;
            this.bullets = context.root.getChildren()[0].script.bullets;
            this.flames = context.root.getChildren()[0].script.flames;
            this.pickables = context.root.getChildren()[0].script.pickables;
            this.teams = context.root.getChildren()[0].script.teams;
            this.profile = context.root.getChildren()[0].script.profile;
            console.log("flames: ",this.flames)
            console.log("bulets: ", this.bullets)
            var self = this;
            var servers = {
                'local': 'http://localhost:30043/socket', // local
                'fsb': 'http://192.168.1.216:30043/socket', //fsb
                'us': 'http://54.67.22.188:30043/socket', // us
                'default': 'https://tanx.playcanvas.com/socket' // load balanced
            };

            var env = getParameterByName('server') || 'default';
            var eventID = getParameterByName('eventID') || '';
            var url = env && servers[env] || servers['default'];
            console.log("client.js eventID",eventID);

            var socket = this.socket = new Socket({ url: url });
            
            this.connected = false;
            
            socket.on('error', function(err) {
                console.log(err);
            });
            
            socket.on('init', function(data) {
            	console.log("client.id",data.id);
            	console.log("roomId",data.roomId);
                self.id = data.id;
                self.connected = true;
                
                if(self.connected){
                	console.log("requesting room");
                	this.socket.send(JSON.stringify({ n:'eventID', d: eventID }));
//                	this.socket.send('message');
                }
                
                users.on(self.id + ':name', function(name) {
                    self.profile.set(name);
                });
            });
            
            socket.on('eventID', function(data) {
                console.log('rcvd evenID',data);
            });
            
            users.bind(socket);
            
            socket.on('tank.new', function(data) {
                self.tanks.new(data);
            });
            
            socket.on('tank.delete', function(data) {
                self.tanks.delete(data);

            });
            
            var dataQueue = [ ];
            
            socket.on('update', function(data) {
                // flames add
                if (data.flames) {
                    console.log("new flames: ",self.flames)
                    for(var i = 0; i < data.flames.length; i++)
                        self.flames.new(data.flames[i]);
                }
                
                // flames delete
                if (data.flamesDelete) {
                    for(var i = 0; i < data.flamesDelete.length; i++)
                        self.flames.finish(data.flamesDelete[i]);
                }
                // bullets add
                if (data.bullets) {
                    console.log("new bullets: ",self.bullets)
                    for(var i = 0; i < data.bullets.length; i++)
                        self.bullets.new(data.bullets[i]);
                }
                
                // bullets delete
                if (data.bulletsDelete) {
                    for(var i = 0; i < data.bulletsDelete.length; i++)
                        self.bullets.finish(data.bulletsDelete[i]);
                }
                
                // pickables add
                if (data.pickable) {
                    for(var i = 0; i < data.pickable.length; i++)
                        self.pickables.new(data.pickable[i]);
                }
                
                // pickable delete
                if (data.pickableDelete) {
                    for(var i = 0; i < data.pickableDelete.length; i++)
                        self.pickables.finish(data.pickableDelete[i]);
                }
                
                // tanks update
                if (data.tanks)
                    self.tanks.updateData(data.tanks);

                // tanks respawn
                if (data.tanksRespawn) {
                    for(var i = 0; i < data.tanksRespawn.length; i++)
                        self.tanks.respawn(data.tanksRespawn[i]);
                }
                
                // teams score
                if (data.teams) {
                    for(var i = 0; i < data.teams.length; i++) {
                        self.teams.teamScore(i, data.teams[i]);
                    }
                }
                
                // winner
                if (data.winner) {
                    self.shoot(false);
                    self.flameOn(false);
                    self.teams.teamWin(data.winner);
                }
            });

            context.mouse.on('mousedown', this.onMouseDown, this);
            context.mouse.on('mouseup', this.onMouseUp, this);
            
            this.gamepadConnected = false;
            this.gamepadActive = false;
            
            window.addEventListener('gamepadconnected', function () {
                this.gamepadConnected = true;
            }.bind(this));
            window.addEventListener('gamepaddisconnected', function () {
                this.gamepadConnected = false;
            }.bind(this));
            
            // Chrome doesn't have the gamepad events, and we can't
            // feature detect them in Firefox unfortunately.
            if ('chrome' in window) {
                // This is a lie, but it lets us begin polling.
                this.gamepadConnected = true;
            }
        },
        
        update: function (dt) {
           this.entity.script.TankAI.takeAction( tankPosition);
        },
        
       onMouseDown: function() {
            // console.log("test");
            // this.layMine(true);
            // shootNow=true;
            flameNow=true;
        },
        
        onMouseUp: function() {
            // this.layMine(false);
            // shootNow=false;
            flameNow=false;
        },
        flameOn: function(state) {
            if (! this.connected)
                return;
                
            if (this.flamingState !== state) {
                this.flamingState = state;
                this.socket.send('flaming', this.shootingState);
            }
        },
        shoot: function(state) {
            if (! this.connected)
                return;
                
            if (this.shootingState !== state) {
                this.shootingState = state;
                this.socket.send('shoot', this.shootingState);
            }
        },
        layMine: function(state) {
            if (! this.connected)
                return;
                
            if (this.shootingState !== state) {
                this.shootingState = state;
                this.socket.send('layMine', this.shootingState);
            }
        }
    };

    return Client;
});