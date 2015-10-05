var Hapi = require('hapi');
var server = new Hapi.Server();
var Inert = require('inert');

var knxreply = function (err, reply) {
    if (err) {
        console.log("ERR", err);
        // 1 is ID not found
        if (err.id === 1) {
            return reply(err.errorMessage).code(404);
        } else {
            return reply(err.errorMessage).code(400);
        }
    }
    return reply();
}

/**
 * Init the HTTP Endpoints and socketio.
 */
var start =  function (httpPort, knx, callback) {

    server.connection({ port: httpPort});

    // Socket.io init
    var io = require('socket.io')(server.listener);
    knx.on('event', function (event) {
        console.log("event", event);
        io.sockets.emit('event', event);
    });

    server.route({
        method: 'GET',
        path: '/rooms',
        handler: function (request, reply) {
            knx.getRooms(request.params.id, function (err) {
                knxreply(err, reply);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/action/{id}',
        handler: function (request, reply) {
            knx.getAction(request.params.id, function (err) {
                knxreply(err, reply);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/knx/refresh',
        handler: function (request, reply) {
            knx.refresh(function (err) {
                knxreply(err, reply);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/knx/{id}',
        handler: function (request, reply) {
            knx.read(request.params.id, function (err) {
                knxreply(err, reply);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/knx/{id}/{value}',
        handler: function (request, reply) {
            knx.write(request.params.id, request.params.value, function (err) {
                knxreply(err, reply);
            });
        }
    });

    // Web Console
    server.register(Inert, function () {
        server.route({
            method: 'GET',
            path: '/console/{path*}',
            handler: {
                 directory: {
                    path: './www',
                    listing: false,
                    index: true
                }
            }
        });
    });

    server.start(function(err){
        if (err) {
            return callback(err);
        }
        return callback();
    });
}

module.exports = {
    start: start
}
