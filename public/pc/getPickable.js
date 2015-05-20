console.log("getPickables.js");
var shield=false;
var itemLoc=[];
var destinationX=0;
var destination=false;
destinationY=0;
var currentPriority=0;
var newPath=false;
pc.script.create("trigger", function (app) {
    var shieldPriority=4;
    var damagePriority=3;
    var repairPriority=1;
    var thisPriority=0;
    var enemyPriority=2;
    var coinPriority=5;

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
            if (entity.name==="pickable-shield"){
                thisPriority=shieldPriority;
            }else if(entity.name==="pickable-repair"){

                thisPriority=repairPriority;
            }else if(entity.name==="pickable-damage"){
                thisPriority=damagePriority;
            }
            else if(entity.name==="pickable-coin"){
                thisPriority=damagePriority;
            }
            else if(entity.name.includes("tank")){
                thisPriority=enemyPriority;
            }
            
            itemLoc = entity.getPosition();
            if (currentPriority < thisPriority){
                destinationX=Math.round(itemLoc.data[0]);
                destinationY=Math.round(itemLoc.data[2]);
                if(logging===true){console.log(this.entity._parent.name+" seeking "+entity.name+" at ["+Math.round(itemLoc.data[0])+","+Math.round(itemLoc.data[2])+"]")} //
                this.entity._parent.destinationX=Math.round(itemLoc.data[0]);
                this.entity._parent.destinationY=Math.round(itemLoc.data[2]);
                newPath=true;
                destination=true;
                this.entity._parent.destination=true;
                currentPriority=thisPriority;
            }
        },
         onTriggerLeave: function (entity) {
            if (entity.name==="pickable-shield"){
 
                thisPriority=shieldPriority
            }else if(entity.name==="pickable-repair"){

                thisPriority=repairPriority
            }else if(entity.name==="pickable-damage"){

                thisPriority=damagePriority
            }
            else if(entity.name.includes("tank")){
                thisPriority=enemyPriority
            }
            itemLoc = entity.getPosition();
            if (currentPriority < thisPriority){
                
                destinationX=Math.round(itemLoc.data[0])
                destinationY=Math.round(itemLoc.data[2])
                this.entity._parent.destinationX=Math.round(itemLoc.data[0])
                this.entity._parent.destinationY=Math.round(itemLoc.data[2])
                console.log(this.entity._parent.name+" seeking "+entity.name+" at ["+Math.round(itemLoc.data[0])+","+Math.round(itemLoc.data[2])+"]");               
                newPath=true;
                destination=true;
                this.entity._parent.destination=true;
                currentPriority=thisPriority;    
            }
        }
    };

    return Trigger;
})