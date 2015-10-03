var Hapi = require('hapi');
var server = new Hapi.Server();

var knxreply = function (err, status, reply) {
    if (err) {
        console.log("ERR", err);
        // 1 is ID not found
        if (err.id === 1) {
            return reply(err.errorMessage).code(404);
        } else {
            return reply(err.errorMessage).code(400);
        }
    }
    return reply(status);
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
            knx.getRooms(request.params.id, function (err, status) {
                knxreply(err, status, reply);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/action/{id}',
        handler: function (request, reply) {
            knx.getAction(request.params.id, function (err, status) {
                knxreply(err, status, reply);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/knx/{id}',
        handler: function (request, reply) {
            knx.read(request.params.id, function (err, status) {
                knxreply(err, status, reply);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/knx/{id}/{value}',
        handler: function (request, reply) {
            knx.write(request.params.id, request.params.value, function (err, status) {
                knxreply(err, status, reply);
            });
        }
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
