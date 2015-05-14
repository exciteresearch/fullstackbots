pc.script.create('tankAI', function (app) {
    // Creates a new TankAI instance
    var TankAI = function (entity) {
        this.entity = entity;
    };

    TankAI.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return TankAI;
});