'use strict'

const _ = require('lodash')
const moment = require('moment')

let _home

/**
 * Manage action / rooms configuration and type conversion.
 */

/**
 * From a id, return the Action.
 * If the action is not found, returns undefined.
 */
const getAction = function (id) {
  const action = _.find(_home.actions, function (action) {
    return action.id === id
  })
  return action
}

/**
 * From a gad/operation ('write' or 'read'), return the Object.
 * If the object is not found, returns undefined.
 */
const getActionFromGAD = function (gad) {
  const action = _.find(_home.actions, function (action) {
    return action.gad === gad
  })
  return action
}

/**
 * Get all the actions
 */
const getAllActions = function () {
  return _home.actions
}

/**
 * Get all the actions for a room.
 */
const getActions = function (room) {
  return _.filter(_home.actions, function (action) {
    return action.room === room
  })
}

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

/**
 * Undecode the val for the given action.
 * for instance if the type is `on-off`, the 1 -> on, 2 -> off.
 * Also remove all the decimals after 2.
 * Returns the val if the type is unknown (should not happen)
 */
const decodeVal = function (action, val) {
  if (action.type === 'on-off') {
    return val === 1 ? 'on' : 'off'
  } else if (action.type === 'window') {
    return val === 1 ? 'open' : 'closed'
  } else if ((action.type === 'temp') || (action.type === 'float')) {
    return val.toFixed(2)
  } else if (action.type === 'time') {
    return getCurrentTime()
  } else if (action.type === 'date') {
    return getCurrentDate()
  }
  return val
}

/**
 * Encode the val for the given action.
 * for instance if the type is `on-off`, the 1 -> on, 2 -> off.
 * Also remove all the decimals after 2.
 * Returns the val if the type is unknown (should not happen)
 */
const encodeVal = function (action, val) {
  if (action.type === 'on-off') {
    return val === 'on' ? 1 : 0
  } else if (action.type === 'window') {
    return val === 'open' ? 1 : 0
  } else if ((action.type === 'temp') || (action.type === 'float')) {
    return val.toFixed(2)
  }
  return val // if date and time should already be dates
}

/**
 * Get all the rooms.
 */
const getRooms = function () {
  return _home.rooms
}

module.exports = function (home) {
  _home = home
  return {
    getAction,
    getAllActions,
    getActions,
    decodeVal,
    encodeVal,
    getActionFromGAD,
    getRooms
  }
}
