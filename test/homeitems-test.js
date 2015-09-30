var chai = require("chai");
var expect = chai.expect;
var homedevices = require("../lib/homedevices")(require('./home_test'));

describe('Get the devices', function() {

    it('should get all the rooms', function(done) {
        var devices = homedevices.getRooms();
        console.log(devices);
        // TODO: ad assert
        done();
    });

    it('should get all the devices', function(done) {
        var devices = homedevices.getAllDevices();
        console.log(devices);
        // TODO: ad assert
        done();
    });

    it('should get the devices for a rooom', function(done) {
        var devices = homedevices.getDevices("soggiorno");
        console.log(devices);
        // TODO: ad assert
        done();
    });

});
