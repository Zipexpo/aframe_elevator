/* global THREE AFRAME */
// var LetterPanel = require('../lib/letterpanel');

AFRAME.registerComponent('button_floor', {
    schema: {
        value: {default: 0},
        color: {default: 0x024caff},
    },

    init: function () {
        this.clicked = false;
        var self = this;
        this.el.addEventListener('click', function (evt) {
            ELEVATOR.currentstate.chooseFloor = self.data.value;
            self.el.emit('chosing-floor');
        });

    },

    update: function () {
        // this.el.setAttribute("text", {value: FLOOR[this.data.value].text});
        // console.log(this);
    }
});