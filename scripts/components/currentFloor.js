/* global THREE AFRAME */
// var LetterPanel = require('../lib/letterpanel');

AFRAME.registerComponent('current-floor', {
    schema: {
        value: {default: 0},
        color: {default: 0x024caff}
    },

    init: function () {

        this.el.sceneEl.addEventListener('set_floor', function () {

        });
    },

    update: function () {
        this.el.setAttribute("text", {value: FLOOR[this.data.value].text});
        console.log(this);
    }
});