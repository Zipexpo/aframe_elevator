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
            document.querySelector('#floor_'+self.data.value+' .hightlight').setAttribute('visible',true);
            self.el.emit('chosing-floor');
        });
        this.v = true;
        this. descriptonAnimation=setInterval(function(){
            document.querySelector('#floor_'+self.data.value+' .description')
                .setAttribute("text", {value: FLOOR[self.data.value][self.v? 'description':'extr']})
            self.v = !self.v;
            }, 2000);

    },

    update: function () {
        // this.el.setAttribute("text", {value: FLOOR[this.data.value].text});
        // console.log(this);
    }
});