///
// This script moves the entity backwards and forwards on the x-axis.
// You can pause the oscillation by pressing the space bar.
///
pc.script.create('oscillator', function (app) {

    // define the constructor
    var Oscillator = function (entity) {
        this.entity = entity;

        this.paused = false; // paused state
        this.amplitude = 10; // The amount to oscillate
        this.time = 0; // The time value for the oscillation
    };

    // define the update function
    Oscillator.prototype = {
        update: function (dt) {

            // Use the keyboard handler from the Application
            // to pause/unpause
            if (app.keyboard.wasPressed(pc.KEY_SPACE)) {
                this.paused = !this.paused; // toggle paused state
            }

            if (!this.paused) {
                // increment the time value by the frametime
                this.time += dt;

                // Calculate the new value
                var x = this.amplitude * Math.sin(this.time);

                // Update the x position of the Entity
                this.entity.setLocalPosition(x, 0, 0);
            }
        }
    };

    // return the class definition
    return Oscillator;
});