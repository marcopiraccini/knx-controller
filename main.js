var eibd = require('eibd');
var bunyan = require('bunyan');
var Hapi = require('hapi');
var server = new Hapi.Server();

var logConfig = require('./config/logger-config');
var log = bunyan.createLogger(logConfig);

// TODO: load from config
var host = '127.0.0.1';
var port = 6720;

/**
 * groupsocketlisten
 */
function groupsocketlisten(opts, callback) {

    var conn = eibd.Connection();
    conn.socketRemote(opts, function() {
        conn.openGroupSocket(0, callback);
    });

}

groupsocketlisten({ host: host, port: port }, function(parser) {

    parser.on('write', function(src, dest, dpt, val){
        var writeEvent = {
            type: 'write',
            src: src,
            dest: dest,
            val:val
        }
        log.info(writeEvent);
        io.sockets.emit('event', writeEvent);
    });

    parser.on('response', function(src, dest, val) {
        var responseEvent = {
            type: 'response',
            src: src,
            dest: dest,
            val:val
        }
        log.info(responseEvent);
        io.sockets.emit('event', writeEvent);
    });

    parser.on('read', function(src, dest) {
        var readEvent = {
            type: 'read',
            src: src,
            dest: dest
        }
        log.info(readEvent);
        io.sockets.emit('event', readEvent);

    });
});

// TODO: Load port from config.
server.connection({ port: 4000, labels: ['ns'] });
var io = require('socket.io')(server.select('ns').listener);


// HTTP Endpoint configuration
server.select('ns').route({
    method: 'GET',
    path: '/{path*}',
    handler: {
         directory: {
            path: './www',
            listing: false,
            index: true
        }
    }
});

server.start(function(err){
    if (err) {
        console.log(err);
    }
    var row = '*********************************************************************';
    console.log(row);
    console.log('KNX Monitor Service Running on port 4000');
    console.log('Connected to KNXD: 127.0.0.1, PORT: 6720');
    console.log(row);
});
