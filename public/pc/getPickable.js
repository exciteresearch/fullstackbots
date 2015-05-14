var shield=false;
var itemLoc=[];

var currentPriority=0;
var newPath=false;
pc.script.create("trigger", function (app) {
    var shieldPriority=3
    var damagePriority=2
    var repairPriority=1
    var thisPriority=0

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
            }
            
            // Reset back to roughly the position the entity started in.
            // console.log(this.entity.script.tanks[0].getPosition())
            // console.log(entity.getPosition(), "entity")
            itemLoc = entity.getPosition();
                if (currentPriority <= thisPriority){
                    destinationX=Math.round(itemLoc.data[0])
                    destinationY=Math.round(itemLoc.data[2])
                    newPath=true;
                    destination=true
                    currentPriority=thisPriority
                }
            if(entity.name=="tank"){
                console.log(entity)
                console.log(entity.angle(entity))
            }
            // console.log("entity position",repairLoc)
            // entity.shoot(position.x, 10, 0);

            // entity.rigidbody.linearVelocity = zeroVec;
            // entity.rigidbody.angularVelocity = zeroVec;
            // entity.rigidbody.syncEntityToBody();
        },
         onTriggerLeave: function (entity) {
            shield=false;
        }
    };

    return Trigger;
})