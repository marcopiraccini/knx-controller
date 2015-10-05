'use strict';

/**
* KNX Wrapper. It exposes write/read operation and it's an EventEmitter
* which emits an "event" event for each KNX message.
*/

var eibd = require('eibd');
var actions = require('./actions')(require('../config/home'));
var events = require('events');
var async = require('async');
var conn; // The eibd connection


var KNX = function (knxHost, knxPort) {
    this.knxHost = knxHost;
    this.knxPort = knxPort;
    events.EventEmitter.call(this);
    var that = this;

    this.write = function(id, value, callback) {
        var action = actions.getAction(id);
        if (!action) {
            var errorMessage = 'Action with id '+ id + ' not found';
            return callback(errorMessage);
        }

        var address = eibd.str2addr(action.gad);
        var conn = eibd.Connection();
        conn.socketRemote({ host: that.knxHost, port: that.knxPort}, function(err) {
            if (err) {
                return callback(err);
            }
            conn.openTGroup(address, 1, function (err) {
                if(err) {
                    return callback(err);
                }
                var dptType;
                if ((action.type === 'temp') || (action.type === 'float')) {
                    dptType = 'DPT5';
                } else if (action.type === 'time') {
                    dptType = 'DPT10';
                } else if (action.type === 'date') {
                    dptType = 'DPT11';
                } else {
                    dptType = 'DPT3';
                }
                var msg = eibd.createMessage('write', dptType, actions.encodeVal(action, value));
                conn.sendAPDU(msg, callback);
            });
        });
    };

    this.read = function(id, callback) {
        var action = actions.getAction(id);

        if (!action) {
            var errorMessage = 'Action with id '+ id + ' not found';
            return callback({id:1, errorMessage: errorMessage});
        }
        var address = eibd.str2addr(action.gad);
        var conn = eibd.Connection();
        conn.socketRemote({ host: that.knxHost, port: that.knxPort}, function(err) {
            if (err) {
                return callback(err);
            }
            conn.openTGroup(address, 1, function (err) {
                if(err) {
                    return callback(err);
                }
                var msg = eibd.createMessage('read');
                conn.sendAPDU(msg, callback);
            });
        });
    };

    // Read all the "Readeable" GADs (to refresh data)
    this.refresh = function(callback) {
        var actionsReadIds = actions.getAllActions().filter(function(action){
                return action.id.endsWith('.read');
            }).map(function(item){
                return item.id;
            });
        async.each(actionsReadIds, function (id, cb) {
            return that.read(id, cb);
        }, function(err){
            if (err) {
                return callback(err);
            }
            return callback();
        });
    };

    this.getAction = function(id, callback) {
        var action = actions.getAction(id);
        if (!action) {
            var errorMessage = 'Action with id '+ id + ' not found';
            return callback({id:1, errorMessage: errorMessage});
        }
        callback(null, action);
    };

    this.getRooms = function(id, callback) {
        callback(null, actions.getRooms());
    };

};

require('util').inherits(KNX, events.EventEmitter);


/**
 * Create the listener object
 */
function init(knxHost, knxPort, callback) {

    var knx = new KNX(knxHost, knxPort);
    var conn = eibd.Connection();

    conn.socketRemote({ host: knxHost, port: knxPort}, function(err) {
        if (err) {
            var errorMessage = `Error in connecting to [${knxHost}, ${knxPort}]`;
            return callback(errorMessage);
        }

        conn.openGroupSocket(0, function(parser) {

            parser.on('write', function(src, dest, dpt, val) {
                var action = actions.getActionFromGAD(dest);
                if (action) {
                    var writeEvent = {
                        type: 'write',
                        dest: action.id,
                        val: actions.decodeVal(action, val),
                        tag: action.tag
                    };
                    knx.emit('event', writeEvent);
                } else {
                    console.log(src,"-",dest,"-",val);
                    console.log("Action with gad:", dest, "unknown");
                }
            });

            parser.on('response', function(src, dest, dpt, val) {
                var action = actions.getActionFromGAD(dest);
                if (action) {
                    var responseEvent = {
                        type: 'response',
                        dest: action.id,
                        val: actions.decodeVal(action, val),
                        tag: action.tag
                    };
                    knx.emit('event', responseEvent);
                } else {
                    console.log("response", src,"-",dest,"-",val);
                    console.log("Action with gad:", dest, "unknown");
                }
            });

            parser.on('read', function(src, dest) {
                var action = actions.getActionFromGAD(dest);
                if (action) {
                    var action = actions.getActionFromGAD(dest);
                    var readEvent = {
                        type: 'read',
                        dest: action.id,
                        tag: action.tag
                    };
                    knx.emit('event', readEvent);

                    // Manage reads to "virtual" (software) KNX dvices
                    if (action.virtual) {
                        if ((action.type === 'time') || (action.type === 'date')) {
                            // Generate a "time" or "date" write on the same address
                            // va is null since the time is the current.
                            knx.write(action.id, actions.decodeVal(action, null));
                        }
                    }
                } else {
                    console.log("read",src,"-",dest,"-");
                    console.log("Action with gad:", dest, "unknown");
                }
            });
        });
    });
    return callback(null, knx);
}

module.exports = {
    init: init
}
