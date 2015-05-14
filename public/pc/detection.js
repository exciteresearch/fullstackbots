var shootNow= false;

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
            if(this.entity.name=="gun sight"){
            var position = entity.getPosition();
            if(entity.name=="tank")
            shootNow= true;
            }
            if (this.entity.name=="right-detection"){
                shootNow="right"
            }
            if (this.entity.name=="left-detection"){
                shootNow="left"
            }
            // entity.rigidbody.linearVelocity = zeroVec;
            // entity.rigidbody.angularVelocity = zeroVec;
            // entity.rigidbody.syncEntityToBody();
        },
         onTriggerLeave: function (entity) {
            shootNow= false;
        }
    };

    return Trigger;
})







// pc.script.create('detection', function (app) {
    
//     var zeroVec = pc.Vec3.ZERO;
    
//     // Creates a new Detection instance
//     var Detection = function (entity) {
//         this.entity = entity;
//     };

//     Detection.prototype = {
//         // Called once after all resources are loaded and before the first update
//         initialize: function () {
//             this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
//         },

//         onTriggerEnter: function(entity){
//             console.log("entity: ", entity);
//         },
        
//         // Called every frame, dt is time in seconds since last update
//         update: function (dt) {
//         }
//     };

//     return Detection;
// });