var shootNow= false;
var flameNow= false;
pc.script.create("trigger", function (app) {

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
            
            // Reset back to roughly the position the entity started in.
            if(this.entity.name=="gun-sight"){
                if(entity.name.includes("tank")){
                shootNow= true;
                flameNow=true;
                }
            }
            if (this.entity.name=="right-detection"&&entity.name.includes("tank")){
                shootNow="right"
            }
            if (this.entity.name=="left-detection"&&entity.name.includes("tank")){
                shootNow="left"
            }
            shootNow="left"
        },
         onTriggerLeave: function (entity) {
            if (this.entity.name=="gun-sight"){
                shootNow= false;
                flameNow=false;
            }
            shootNow="left"
            
        }
    };

    return Trigger;
})





