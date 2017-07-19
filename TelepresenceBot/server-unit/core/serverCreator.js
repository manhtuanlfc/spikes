var express = require('express'),
    app = express(),
    httpServer = require('http').createServer(app),
    io = require('socket.io')(httpServer),
    path = require('path'),
    debug = require('debug')('server'),
    BotLocator = require('./botLocator.js'),
    Router = require('./router.js'),
    Disconnector = require('./disconnector.js'),
    Observer = require('./observer.js');

var botLocator = new BotLocator(io.sockets.adapter.rooms);
var router = new Router(botLocator);
var disconnector = new Disconnector(io.sockets.adapter.rooms, io.sockets.connected);
var observer = new Observer();

function ServerCreator() {
    debug("created!")
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/html/index.html');
    });

    app.get('/rooms', function(req, res) {
        res.sendFile(__dirname + '/json/rooms.json');
    });

    io.use(function(client, next) {
        return router.route(client, next);
    });

    io.sockets.on("connection", function (socket) {
        var roomName = socket.handshake.query.room;

        socket.join(roomName);
        socket.emit('joined_room', roomName)

        debug('a user connected: %s and joined room: %s', socket.id, roomName);

        socket.on('disconnect', function(){
            debug('a user disconnected: %s and left room: %s', socket.id, roomName);
            disconnector.disconnectRoom(socket.id);
            observer.notify('disconnect', socket.id);
        });
    });
}

ServerCreator.prototype.withRouter = function(alternativeRouter) {
    router = alternativeRouter;
}

ServerCreator.prototype.withDisconnector = function(alternativeDisconnector) {
    disconnector = alternativeDisconnector;
}

ServerCreator.prototype.withObserver = function(alternativeObserver) {
    observer = alternativeObserver;
}

ServerCreator.prototype.create = function() {
    var server = httpServer.listen(4200, function() {
        debug("Express server listening on port %s", 4200);
    });

    return server;
}

module.exports = ServerCreator;


