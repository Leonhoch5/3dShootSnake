const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const game = require('./game');
const lobby = require('./lobby');
const account = require('./account');
const friend = require('./friend');

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    game.init(socket, io);
    lobby.init(socket, io);
    account.init(socket, io);
    friend.init(socket, io);

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        game.disconnect(socket, io);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
