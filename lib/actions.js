'use strict';

var _ = require ('lodash');
var moment = require('moment');

var _home;

/**
 * Manage action / rooms configuration and type conversion.
 */

/**
 * From a id, return the Action.
 * If the action is not found, returns undefined.
 */
var getAction = function (id) {
    var action =  _.find(_home.actions, function (action) {
        return action.id === id;
    });
    return action;
};

/**
 * From a gad/operation ('write' or 'read'), return the Object.
 * If the object is not found, returns undefined.
 */
var getActionFromGAD = function (gad) {
    var action =  _.find(_home.actions, function (action) {
        return action.gad === gad;
    });
    return action;
};


/**
 * Get all the actions
 */
var getAllActions = function () {
    return _home.actions;
};

/**
 * Get all the actions for a room.
 */
var getActions = function (room) {
    return _.filter(_home.actions, function (action) {
        return action.room === room;
    });
};

var getCurrentTime = function () {
    var time = [];
    var mom =  moment();
    time[0] = mom.isoWeekday();
    time[1] = mom.hour();
    time[2] = mom.minute();
    time[3] = mom.seconds();
    return time;
};

/**
 * Get the current date in the form [day, month, year]
 */
var getCurrentDate = function () {
    // For the date the value must be:
    var date = [];
    var mom =  moment();
    date[0] = mom.date();
    date[1] = mom.month() + 1; // for moment, january it's 0.
    date[2] = Number(mom.year().toString().substr(2,3));
    return date;
};

/**
 * Undecode the val for the given action.
 * for instance if the type is `on-off`, the 1 -> on, 2 -> off.
 * Also remove all the decimals after 2.
 * Returns the val if the type is unknown (should not happen)
 */
var decodeVal = function (action, val) {

    if (action.type === 'on-off') {
        return val === 1 ? 'on':'off';
    } else if (action.type === 'window') {
        return val === 1 ? 'open':'closed';
    } else if ((action.type === 'temp') || (action.type === 'float')) {
        return val.toFixed(2);
    } else if (action.type === 'time') {
        return getCurrentTime();
    } else if (action.type === 'date') {
        return getCurrentDate();
    }
    return val;
};

/**
 * Encode the val for the given action.
 * for instance if the type is `on-off`, the 1 -> on, 2 -> off.
 * Also remove all the decimals after 2.
 * Returns the val if the type is unknown (should not happen)
 */
var encodeVal = function (action, val) {
    if (action.type === 'on-off') {
        return val === 'on' ? 1:0;
    } else if (action.type === 'window') {
        return val === 'open' ? 1:0;
    } else if ((action.type === 'temp') || (action.type === 'float')) {
        return val.toFixed(2);
    }
    return val; // if date and time should already be dates
};

/**
 * Get all the rooms.
 */
var getRooms = function () {
    return _home.rooms;
};

module.exports = function (home) {
    _home = home;
    return {
        getAction: getAction,
        getAllActions: getAllActions,
        getActions: getActions,
        decodeVal: decodeVal,
        encodeVal: encodeVal,
        getActionFromGAD: getActionFromGAD,
        getRooms: getRooms
    };
};
