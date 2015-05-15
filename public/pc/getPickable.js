var shield=false;
var itemLoc=[];

var currentPriority=0;
var newPath=false;
pc.script.create("trigger", function (app) {
    var shieldPriority=3
    var damagePriority=2
    var repairPriority=1
    var thisPriority=0
    var enemyPriority=4

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
 
                thisPriority=shieldPriority
            }else if(entity.name==="pickable-repair"){

                thisPriority=repairPriority
            }else if(entity.name==="pickable-damage"){

                thisPriority=damagePriority
            }else if(entity.name.includes("tank")){
                thisPriority=enemyPriority
            }
            itemLoc = entity.getPosition();
                if (currentPriority <= thisPriority){
                    destinationX=Math.round(itemLoc.data[0])
                    destinationY=Math.round(itemLoc.data[2])
                    newPath=true;
                    destination=true
                    currentPriority=thisPriority
                }
        },
         onTriggerLeave: function (entity) {
            shield=false;
        }
    };

    return Trigger;
})