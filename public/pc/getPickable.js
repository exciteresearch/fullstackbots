





//ian edit: my, currently global, function library:

var randomDirection= function(unstickTime){
        movement=[Math.round(Math.random()*2-1),Math.round(Math.random()*2-1)]
        return movement;
    };
var logging=true;
var unstickTime=100;
var currentPlayer={
    currentPriority:0,
    shieldPriority:4,
    specialPriority:3,
    repairPriority:1,
    thisPriority:0,
    enemyPriority:6,
    coinPriority:5,
    movement:[0,0]
};
var opponentBot={
    currentPriority:0,
    shieldPriority:4,
    specialPriority:3,
    repairPriority:1,
    thisPriority:0,
    enemyPriority:6,
    coinPriority:5,
    movement:[0,0],
    shootNow: "left"
};
//ian edit: end my library

pc.script.create("trigger", function (app) {

    var itemLoc=[];

    var zeroVec = pc.Vec3.ZERO;

    var Trigger = function (entity) {
        this.entity = entity;
    };
    
    Trigger.prototype = {
        
        initialize: function () {
            this.entity.collision.on('triggerenter', this.onTriggerEnter, this),
            this.entity.collision.on('triggerleave', this.onTriggerLeave, this);
        },

        onTriggerEnter: function (entity) {
            if (this.entity._parent.Owner!==null){
                var user= currentPlayer
            }else{
                var user= opponentBot
            }
            itemLoc = entity.getPosition();
            if (entity.name==="pickable-shield"){
                this.entity._parent.closest.shield=itemLoc;
                user.thisPriority=user.shieldPriority;
            }else if(entity.name==="pickable-repair"){
                this.entity._parent.closest.repair=itemLoc;
                user.thisPriority=user.repairPriority;
            }else if(entity.name==="pickable-damage"){
                this.entity._parent.closest.special=itemLoc;
                user.thisPriority=user.specialPriority;
            }
            else if(entity.name==="pickable-coin"){
                this.entity._parent.closest.coin=itemLoc;
                user.thisPriority=user.coinPriority;
            }
            else if(entity.name.includes("tank")){
                this.entity._parent.closest.tank=itemLoc;
                user.thisPriority=user.enemyPriority;
            }
            
            if (user.currentPriority < user.thisPriority){
                user.destinationX=Math.round(itemLoc.data[0]);
                user.destinationY=Math.round(itemLoc.data[2]);
                if(logging===true){console.log(this.entity._parent.name+" seeking "+entity.name+" at ["+Math.round(itemLoc.data[0])+","+Math.round(itemLoc.data[2])+"]")} //
                user.destinationX=Math.round(itemLoc.data[0]);
                user.destinationY=Math.round(itemLoc.data[2]);
                user.newPath=true;
                user.destination=true;
                this.entity.destination=true;
                user.currentPriority = user.thisPriority;
            }
        },
         onTriggerLeave: function (entity) {
            if (this.entity._parent.Owner!==null){
                var user= currentPlayer
            }else{
                var user= opponentBot
            }
            itemLoc = entity.getPosition();
            if (entity.name==="pickable-shield"){

                this.entity._parent.closest.shield=itemLoc;
                user.thisPriority=user.shieldPriority;
            }else if(entity.name==="pickable-repair"){
                this.entity._parent.closest.repair=itemLoc;
                user.thisPriority=user.repairPriority;
            }else if(entity.name==="pickable-damage"){
                this.entity._parent.closest.special=itemLoc;
                user.thisPriority=user.specialPriority;
            }
            else if(entity.name==="pickable-coin"){
                this.entity._parent.closest.coin=itemLoc;
                user.thisPriority=user.coinPriority;
            }
            else if(entity.name.includes("tank")){
                this.entity._parent.closest.tank=itemLoc;
                user.thisPriority=user.enemyPriority;
            }
            if (user.currentPriority < user.thisPriority){
                user.destinationX=Math.round(itemLoc.data[0]);
                user.destinationY=Math.round(itemLoc.data[2]);
                if(logging===true){console.log(this.entity._parent.name+" seeking "+entity.name+" at ["+Math.round(itemLoc.data[0])+","+Math.round(itemLoc.data[2])+"]")} //
                user.destinationX=Math.round(itemLoc.data[0]);
                user.destinationY=Math.round(itemLoc.data[2]);
                user.newPath=true;
                user.destination=true;
                this.entity.destination=true;
                user.currentPriority = user.thisPriority;
            }
        }
    };

    return Trigger;
})