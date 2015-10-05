'use strict';

var influx = require('influx');

/**
* Eventstore.
*/

function start(knx) {
    var client = influx({
      // or single-host configuration
      host : '192.168.69.172',
      port: 8086,
      database : 'home'
    });

    if (knx){
        knx.on('event', function (event) {
            console.log("event to store", event);
            //var point = { attr : event.val, time : new Date()};

            client.writePoint(event.dest, Number(event.val), {tag: event.tag},  function (err, response) {
                if (err) {
                    return console.log("ERROR IN STORING EVENT", err);
                }
                // Don't care about the answer...
            })
        });
    }
}

module.exports = {
    start: start
}
