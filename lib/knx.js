'use strict'

/**
* KNX Wrapper. It exposes write/read operation and it's an EventEmitter
* which emits an "event" event for each KNX message.
*/

const eibd = require('eibd')
const actions = require('./actions')(require('../config/home'))
const events = require('events')
const moment = require('moment')
const async = require('async')
let conn // The eibd connection

/**
 * Get the current time in the form [dayOfTheWeek, hour, minutes, seconds]
 */
const getCurrentTime = function () {
  const time = []
  const mom = moment()
  time[0] = mom.isoWeekday()
  time[1] = mom.hour()
  time[2] = mom.minute()
  time[3] = mom.seconds()
  return time
}

/**
 * Get the current date in the form [day, month, year]
 */
const getCurrentDate = function () {
  // For the date the value must be:
  const date = []
  const mom = moment()
  date[0] = mom.date()
  date[1] = mom.month() + 1 // for moment, january it's 0.
  date[2] = Number(mom.year().toString().substr(2, 3))
  return date
}

const KNX = function (knxHost, knxPort) {
  this.knxHost = knxHost
  this.knxPort = knxPort
  events.EventEmitter.call(this)
  const that = this

  this.write = function (id, value, callback) {
    const action = actions.getAction(id)
    if (!action) {
      const errorMessage = 'Action with id ' + id + ' not found'
      return callback(errorMessage)
    }

    const address = eibd.str2addr(action.gad)
    const conn = eibd.Connection()
    conn.socketRemote({ host: that.knxHost, port: that.knxPort }, function (err) {
      if (err) {
        return callback(err)
      }
      conn.openTGroup(address, 1, function (err) {
        if (err) {
          return callback(err)
        }
        let dptType
        if ((action.type === 'temp') || (action.type === 'float')) {
          dptType = 'DPT5'
        } else if (action.type === 'time') {
          dptType = 'DPT10'
          value = getCurrentTime()
        } else if (action.type === 'date') {
          dptType = 'DPT11'
          value = getCurrentDate()
        } else {
          dptType = 'DPT3'
        }
        const msg = eibd.createMessage('write', dptType, actions.encodeVal(action, value))
        conn.sendAPDU(msg, callback)
      })
    })
  }

  this.read = function (id, callback) {
    const action = actions.getAction(id)

    if (!action) {
      const errorMessage = 'Action with id ' + id + ' not found'
      return callback({ id: 1, errorMessage })
    }
    const address = eibd.str2addr(action.gad)
    const conn = eibd.Connection()
    conn.socketRemote({ host: that.knxHost, port: that.knxPort }, function (err) {
      if (err) {
        return callback(err)
      }
      conn.openTGroup(address, 1, function (err) {
        if (err) {
          return callback(err)
        }
        const msg = eibd.createMessage('read')
        conn.sendAPDU(msg, callback)
      })
    })
  }

  // Read all the "Readeable" GADs (to refresh data)
  this.refresh = function (callback) {
    const actionsReadIds = actions.getAllActions().filter(function (action) {
      return action.id.endsWith('.read')
    }).map(function (item) {
      return item.id
    })
    async.each(actionsReadIds, function (id, cb) {
      return that.read(id, cb)
    }, function (err) {
      if (err) {
        return callback(err)
      }
      return callback()
    })
  }

  this.getAction = function (id, callback) {
    const action = actions.getAction(id)
    if (!action) {
      const errorMessage = 'Action with id ' + id + ' not found'
      return callback({ id: 1, errorMessage })
    }
    callback(null, action)
  }

  this.getRooms = function (id, callback) {
    callback(null, actions.getRooms())
  }
}

require('util').inherits(KNX, events.EventEmitter)

/**
 * Create the listener object
 */
function init (knxHost, knxPort, callback) {
  const knx = new KNX(knxHost, knxPort)
  const conn = eibd.Connection()

  conn.socketRemote({ host: knxHost, port: knxPort }, function (err) {
    if (err) {
      const errorMessage = `Error in connecting to [${knxHost}, ${knxPort}]`
      return callback(errorMessage)
    }

    conn.openGroupSocket(0, function (parser) {
      parser.on('write', function (src, dest, dpt, val) {
        const action = actions.getActionFromGAD(dest)
        if (action) {
          const writeEvent = {
            type: 'write',
            dest: action.id,
            val: actions.decodeVal(action, val),
            tag: action.tag
          }
          knx.emit('event', writeEvent)
        } else {
          console.log(src, '-', dest, '-', val)
          console.log('Action with gad:', dest, 'unknown')
        }
      })

      parser.on('response', function (src, dest, dpt, val) {
        const action = actions.getActionFromGAD(dest)
        if (action) {
          const responseEvent = {
            type: 'response',
            dest: action.id,
            val: actions.decodeVal(action, val),
            tag: action.tag
          }
          knx.emit('event', responseEvent)
        } else {
          console.log('response', src, '-', dest, '-', val)
          console.log('Action with gad:', dest, 'unknown')
        }
      })

      parser.on('read', function (src, dest) {
        var action = actions.getActionFromGAD(dest)
        if (action) {
          var action = actions.getActionFromGAD(dest)
          const readEvent = {
            type: 'read',
            dest: action.id,
            tag: action.tag
          }
          knx.emit('event', readEvent)

          // Manage reads to "virtual" (software) KNX dvices
          if (action.virtual) {
            if ((action.type === 'time') || (action.type === 'date')) {
              // Generate a "time" or "date" write on the same address
              // va is null since the time is the current.
              knx.write(action.id, actions.decodeVal(action, null))
            }
          }
        } else {
          console.log('read', src, '-', dest, '-')
          console.log('Action with gad:', dest, 'unknown')
        }
      })
    })
  })
  return callback(null, knx)
}

module.exports = {
  init
}
