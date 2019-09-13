/* global AFRAME */
WEATHER = {
    CLOUDY: 0,
    SUNNY: 1,
    RAIN: 2,
    SNOW: 3,
};
EVENT = {
    NORMAL:0,
    FIRE: 1,
    HURRICAN: 2,
};
ELEVATOR.currentstate = {
    level: 0,
    levelArr:[],
    time: 0,
    weather: WEATHER.NICE,
    event: EVENT.NORMAL,
    chooseFloor:0,
    direction:1,
};
TIMER ={
    openWait:2,
    moving:4,
    keepopen: 2,
    skipclose: -1,
}
FLOOR = {
    '-1':{text:'B',description:'Basement',extr:'basement: hardware storage'},
    0:{text:'1',description:'Ground/1st Floor',extr:'Parking lot right here'},
    1:{text:2,description:'Office',extr:'Department office'},
    2:{text:3,description:'Laboratory',extr:'Laboratory and Faculty office'},
}
AFRAME.registerComponent('gamestate', {
    schema: {
        level: {default: 0},
        chooseFloor: {default: 0},
        levelArr: {default: []},
        isReachFloor: {default: false},
        isOpen: {default: false},
        timecounter: {default:0},
        state: {default: 'STATE_REACH', oneOf: ['STATE_MOVING', 'STATE_REACH', 'DOOR_OPENING', 'DOOR_CLOSING']}
    },

    stateReach: function (newState, level,reach) {
        console.log(level)
        if (level!==null&&level!==undefined) {
            newState.state = reach ? 'DOOR_OPENING' : newState.state;
            newState.isReachFloor = reach;
            newState.timecounter = 0;
            document.getElementById('voice' + level).components.sound.playSound();
        }
        // document.getElementById('mainThemeMusic').components.sound.pauseSound();
    },
    init: function () {
        var self = this;
        var el = this.el;
        var initialState = this.initialState;
        var state = this.data;

        // Initial state.
        if (!initialState) { initialState = state; }

        el.emit('gamestate-initialized', {state: initialState});

        registerHandler('chosing-floor', function (newState) {
            document.getElementById('clicksound').components.sound.playSound();
            if (ELEVATOR.currentstate.levelArr.indexOf(ELEVATOR.currentstate.chooseFloor)===-1||newState.level===ELEVATOR.currentstate.chooseFloor) {
                if(ELEVATOR.currentstate.levelArr.indexOf(ELEVATOR.currentstate.chooseFloor)===-1)
                    ELEVATOR.currentstate.levelArr.push(ELEVATOR.currentstate.chooseFloor);
                if (ELEVATOR.currentstate.levelArr.length==1){
                    ELEVATOR.currentstate.direction = (ELEVATOR.currentstate.chooseFloor-ELEVATOR.currentstate.level)>0?1:-1;
                }else {
                    ELEVATOR.currentstate.levelArr = ELEVATOR.currentstate.levelArr.filter(function (d) {
                        if(ELEVATOR.currentstate.direction * (d - ELEVATOR.currentstate.level) > 0)
                        {
                            return true;
                        }else {
                            document.querySelector('#floor_'+ELEVATOR.currentstate.chooseFloor+' .hightlight').setAttribute('visible',false);
                            return false;
                        }
                    });
                }
                ELEVATOR.currentstate.levelArr = ELEVATOR.currentstate.levelArr.sort(function(a,b){return ELEVATOR.currentstate.direction*(a-b)});
                if ((newState.state==="DOOR_CLOSING"|| newState.state==="STATE_REACH")&& newState.level===ELEVATOR.currentstate.chooseFloor) {
                    newState.state = 'DOOR_OPENING';
                }else if (ELEVATOR.currentstate.levelArr.length==1){
                    newState.level = ELEVATOR.currentstate.level + ELEVATOR.currentstate.direction/2;
                    newState.state = 'STATE_MOVING';
                }
            }
            return newState;
        });

        registerHandler('set_floor', function (newState) {
            newState.level=newState.level+ELEVATOR.currentstate.direction/2;
            ELEVATOR.currentstate.level = newState.level;
            if (ELEVATOR.currentstate.levelArr.indexOf(newState.level)!==-1 || ELEVATOR.currentstate.levelArr.length===0&& ELEVATOR.currentstate.level===0) {
                ELEVATOR.currentstate.levelArr.shift()
                document.querySelector('#floor_'+ ELEVATOR.currentstate.level+' .hightlight').setAttribute('visible',false);
                newState.state = 'DOOR_OPENING';
                self.stateReach(newState,newState.level,true);
            }else{
                newState.state = 'STATE_MOVING';
                self.stateReach(newState,newState.level,false);
            }
            if (ELEVATOR.currentstate.level===2)
                ELEVATOR.currentstate.direction = -1;
            else if (ELEVATOR.currentstate.level===-1)
                ELEVATOR.currentstate.direction = 1;
            return newState;
        });

        registerHandler('moving', function (newState) {
            if (newState.level%1===0)
                newState.level = ELEVATOR.currentstate.level + ELEVATOR.currentstate.direction/2;
            return newState;
        });


        registerHandler('open_door_btn', function (newState) {
            if (newState.isOpen) {
                newState.timecounter += TIMER.keepopen * 1000;
            }
            return newState;
        });

        registerHandler('close_door_btn', function (newState) {
            if (newState.isOpen)
                newState.timecounter -= TIMER.skipclose*1000; // timmer
            return newState;
        });

        // registerHandler('opening_door', function (newState) {
        //     newState.isOpen = true;
        //     newState.timecounter = TIMER.openWait*1000;
        //     return newState;
        // });

        registerHandler('closing_door', function (newState) {
            if (newState.state==='DOOR_OPENING')
                newState.timecounter = TIMER.openWait*1000;
            newState.state = 'DOOR_CLOSING';
            return newState;
        });




        function registerHandler (event, handler) {
            el.addEventListener(event, function (param) {
                var newState = handler(AFRAME.utils.extend({}, state), param);
                publishState(event, newState);
            });
        }

        function publishState (event, newState) {
            var oldState = AFRAME.utils.extend({}, state);
            el.setAttribute('gamestate', newState);
            state = newState;
            el.emit('gamestate-changed', {
                event: event,
                diff: AFRAME.utils.diff(oldState, newState),
                state: newState
            });
        }
    }
});

/**
 * Bind game state to a component property.
 */
AFRAME.registerComponent('gamestate-bind', {
    schema: {
        default: {},
        parse: AFRAME.utils.styleParser.parse
    },

    update: function () {
        var sceneEl = this.el.closestScene();
        if (sceneEl.hasLoaded) {
            this.updateBinders();
        }
        sceneEl.addEventListener('loaded', this.updateBinders.bind(this));
    },

    updateBinders: function () {
        var data = this.data;
        var el = this.el;
        var subscribed = Object.keys(this.data);

        el.sceneEl.addEventListener('gamestate-changed', function (evt) {
            syncState(evt.detail.diff);
            if (evt.detail.diff.state!==undefined||evt.detail.diff.level!==undefined&&evt.detail.diff.level%1===0)
                stateEvent (evt.detail.state,el);
        });

        el.sceneEl.addEventListener('gamestate-initialized', function (evt) {
            syncState(evt.detail.state);
        });

        function syncState (state) {
            Object.keys(state).forEach(function updateIfNecessary (stateProperty) {
                var targetProperty = data[stateProperty];
                var value = state[stateProperty];
                if (subscribed.indexOf(stateProperty) === -1) { return; }
                AFRAME.utils.entity.setComponentProperty(el, targetProperty, value);
            });
        }
    }
});