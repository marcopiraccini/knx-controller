var _ = require ('lodash');

var _home;

/**
 * From a GAD + action ('read', 'write'), return the Object.
 * If the object is not foud, returns the gad.
 */
var getDevice = function (gad) {
    var devices =  _.filter(_home.devices, function (device) {
        return device.gad === gad;
    });
    if (devices.length === 0) return [gad];
    return devices;
};

/**
 * Get all the devices
 */
var getAllDevices = function () {
    return _home.devices;
};

/**
 * Get all the devices for a room.
 */
var getDevices = function (room) {
    return _.filter(_home.devices, function (device) {
        return device.room === room;
    });
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
        getDevice: getDevice,
        getAllDevices: getAllDevices,
        getDevices: getDevices,
        getRooms: getRooms
    };
};
