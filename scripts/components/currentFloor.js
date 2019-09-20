/* global THREE AFRAME */
// var LetterPanel = require('../lib/letterpanel');

AFRAME.registerComponent('current-floor', {
    schema: {
        value: {default: 0},
        color: {default: 0x024caff}
    },

    init: function () {

        this.el.sceneEl.addEventListener('set_floor', function () {
            console.log('Here')

        });
    },

    update: function () {
        if(this.data.value%1===0) {
            this.el.setAttribute("text", {value: FLOOR[this.data.value].text});
            document.querySelector('#displayFloor').setAttribute("text", {value: 'Current floor: '+FLOOR[this.data.value].text});
        }else {
            var displayf = ELEVATOR.currentstate.direction > 0 ? Math.ceil(this.data.value) : Math.floor(this.data.value);
            displayf = Math.min(Math.max(displayf,-1),2);
            document.querySelector('#displayFloor').setAttribute("text", {value: 'Next floor: '+FLOOR[displayf].text});
            document.querySelector('#videofloor')
                .setAttribute("src", '#floor_' + displayf+'Video');
            document.querySelector('#floor_' + displayf+'Video').play();
        }
    }
});