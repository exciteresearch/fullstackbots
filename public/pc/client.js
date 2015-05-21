

pc.script.create('client', function (context) {
	var botCode = null; //do not remove or the orange PlayCanvas logo will remain on screen
    var p=0;
    var counter=0;
    var tmpVec = new pc.Vec3();
    var uri = new pc.URI(window.location.href);
    var query = uri.getQuery();
    // var gamepadNum = query.gamepad;

    var Client = function (entity) {
        this.entity = entity;
        this.id = null;
        this.moved=0;
        this.movement = [ 0, 0 ];
        this.pastLocations=[];
        this.opponent={
            id : null,
            moved: 0,
            movement :[ 0, 0 ],
            pastLocations:[],
            parent: this
            
        };
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

            this.opponent.tanks = context.root.getChildren()[0].script.tanks;
            this.opponent.bullets = context.root.getChildren()[0].script.bullets;
            this.opponent.flames = context.root.getChildren()[0].script.flames;
            this.opponent.pickables = context.root.getChildren()[0].script.pickables;
            this.opponent.teams = context.root.getChildren()[0].script.teams;
            this.opponent.profile = context.root.getChildren()[0].script.profile;

            var self = this;
            var servers = {
                'local': 'http://localhost:30043/socket', // local
                // 'fsb': 'http://192.168.1.216:30043/socket', //fsb
               'fsb': 'http://localhost:30043/socket', //fsbx
                'us': 'http://54.67.22.188:30043/socket', // us
                'default': 'https://tanx.playcanvas.com/socket' // load balanced
            };

            var env = getParameterByName('server') || 'default';
            var eventID = getParameterByName('eventID') || ''; // if no event ID then AI don't move
            var botOneID = getParameterByName('botOneID') || '';

            var url = env && servers[env] || servers['default'];

            $.ajax({
            	  url: "/api/dispatcher/readFile?botOneID="+botOneID,
            	  context: document.body
            	}).done(function(data) {
            		botCode = data.botCode;
            	});            
            
            var socket = this.socket = new Socket({ url: url });
            
            this.connected = false;
            
            socket.on('error', function(err) {
                console.log(err);
            });
            
            socket.on('init', function(data) {
                self.id = data.id;
                self.connected = true;
                
                if(self.connected){
                	this.socket.send(JSON.stringify({ n:'eventID', d: eventID }));
//                	this.socket.send('message');
                }
                
                users.on(self.id + ':name', function(name) {
                    self.profile.set(name);
                });
            });
            
            socket.on('eventID', function(data) {
                console.log('room eventID=',data);
            });
            
            users.bind(socket);
            
            socket.on('tank.new', function(data) {
                console.log("data", data)
                self.tanks.new(data);
            });
            
            // request the spawning of an opponent tank AI
            socket.on('opponentTank.new', function(data) {
                console.log("data opp", data)
                self.opponent.tanks.new(data);
            });
            
            socket.on('tank.delete', function(data) {
                self.tanks.delete(data);

            });
            socket.on('opponentTank.delete', function(data) {
                self.opponent.tanks.delete(data);

            });
            
            var dataQueue = [ ];
            
            socket.on('update', function(data) {
                // flames add
                if (data.flames) {
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
                if (data.tanks){
                    //ian edit: sends opponent vs client data to the appropriate locations.
                    if(data.tanks[0].opponentTank===true){
                        self.tanks.updateData(data.tanks[1]);
                        self.opponent.tanks.updateData(data.tanks[0]);
                    }else{
                        self.tanks.updateData(data.tanks[0]);
                        self.opponent.tanks.updateData(data.tanks[1]);
                    }
                    self.tanks.updateData(data.tanks);
                }

                    // if(p<4){
                    //     console.log("data",data.tanks)
                    //     console.log("this",this)
                    //     p++
                    // }
                    

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
        },
        
        update: function (dt) {

        	
        	// botCode applied using eval()
        	if(!!botCode){
        		var evalCode = "this.entity.script.TankAI.takeAction = function(tankPosition){"+botCode+"}";
        		eval(evalCode);
        		botCode = null;
        	}
        	

        	if(!!this.entity.script.TankAI.takeAction){
                this.entity.script.TankAI.takeAction(tankPosition); 
        	}
       	// this.entity.script.TankAI.callBotCode = function(takeAction){
       	// 	self = takeAction;
       	// 	takeAction.call(this,botCode);
       	// };
        	
           this.opponent.tanks.entity.script.FSBpanzer.takeAction(opponentTankPosition);

        },
        
       onMouseDown: function() {
            this.layMine(true);
            this.shootNow=true;
            opponentBot.shootNow=true;
            opponentBot.flameNow=true;
        },
        
        onMouseUp: function() {
            this.layMine(false);
            this.shootNow=false;
            opponentBot.shootNow=false;
            opponentBot.flameNow=false;
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