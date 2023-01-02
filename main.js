const Os = require('os')
Os.tmpDir = Os.tmpDir || Os.tmpdir

const eibd = require('eibd')

const bunyan = require('bunyan')
const Hapi = require('hapi')
const server = new Hapi.Server()
const fs = require('fs')
const logConfig = require('./config/logger-config')
const log = bunyan.createLogger(logConfig)

// TODO: load configurations from config
// Add the config file position using ENV.
const knxHost = '192.168.69.232'
const knxPort = 6720
const httpPort = 4000

const knx = require('./lib/knx')
const api = require('./lib/api')
// var eventstore = require('./lib/eventstore');

// Init the knx connection and the the othe sub-components
knx.init(knxHost, knxPort, function (err, knx) {
  if (err) {
    console.log('**** Error', err, 'Exiting, check that KNXD is up and running\n')
    process.exit(1)
  }

  // Start the event store
  // eventstore.start(knx)

  // Start the HTTP module (API / Web Content)
  api.start(httpPort, knx, function (err) {
    if (err) {
      console.log(err)
    }
    const row = '*********************************************************************'
    console.log(row)
    console.log('KNX Controller Service Running on port 4000')
    console.log(`Connected to KNXD: ${knxHost}, PORT: ${knxPort}`)
    console.log(row)
  })
})
