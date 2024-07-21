let lobbies = {};

function init(socket, io) {
    socket.on('joinLobby', (lobbyId) => {
        if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = [];
        }
        lobbies[lobbyId].push(socket.id);
        socket.join(lobbyId);
        io.to(lobbyId).emit('lobbyUpdate', lobbies[lobbyId]);
    });

    socket.on('leaveLobby', (lobbyId) => {
        if (lobbies[lobbyId]) {
            lobbies[lobbyId] = lobbies[lobbyId].filter(id => id !== socket.id);
            socket.leave(lobbyId);
            io.to(lobbyId).emit('lobbyUpdate', lobbies[lobbyId]);
        }
    });
}

module.exports = { init };
