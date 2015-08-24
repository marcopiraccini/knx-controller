'use strict';

/**
 * Log configuration. See https://github.com/trentm/node-bunyan
 */
var logConfig = {
    name: 'events',
    streams: [{
        level: 'debug',
        type: 'rotating-file',
        period: '1d',   // daily rotation
        count: 3,       // keep 3 back copies
        path: './logs/knx-events.log'
    },{
        level: 'info',
        stream: process.stdout
    }]
};

module.exports = logConfig;
