'use strict'

const influx = require('influx')

/**
* Eventstore.
*/

function start (knx) {
  const client = influx({
    // or single-host configuration
    host: '192.168.69.172',
    port: 8086,
    database: 'home'
  })

  if (knx) {
    knx.on('event', function (event) {
      console.log('event to store', event)
      // var point = { attr : event.val, time : new Date()};
      let tag = event.tag
      if (!tag) {
        tag = 'knx'
      }
      const measure = event.dest.split('.').join('_') // influxdb doesn't like points...
      if ((tag) && ((tag === 'energy') || (tag === 'temp'))) {
        client.writePoint(measure, Number(event.val), { tag }, function (err, response) {
          if (err) {
            return console.log('ERROR IN STORING EVENT', err)
          }
          // Don't care about the answer...
        })
      }
    })
  }
}

module.exports = {
  start
}
