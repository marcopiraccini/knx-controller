var eibd = require('eibd');
var bunyan = require('bunyan');
var Hapi = require('hapi');
var server = new Hapi.Server();
var fs = require('fs');
var logConfig = require('./config/logger-config');
var log = bunyan.createLogger(logConfig);

// TODO: load configurations from config
// Add the config file position using ENV.
var knxHost = '192.168.69.172';
var knxPort = 6720;
var httpPort = 4000;

var knx = require('./lib/knx');
var api = require('./lib/api');
var eventstore = require('./lib/eventstore');

// Init the knx connection and the the othe sub-components
knx.init(knxHost, knxPort, function (err, knx) {
    if (err) {
        console.log('**** Error', err, `Exiting, check that KNXD is up and running\n`);
        process.exit(1);
    }

    // Start the event store
    eventstore.start(knx);

    // Start the HTTP module (API / Web Content)
    api.start(httpPort, knx, function(err) {
        if (err) {
            console.log(err);
        }
        var row = '*********************************************************************';
        console.log(row);
        console.log('KNX Controller Service Running on port 4000');
        console.log(`Connected to KNXD: ${knxHost}, PORT: ${knxPort}`);
        console.log(row);
    });
});
