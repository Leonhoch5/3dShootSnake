let friends = {};

function init(socket, io) {
    socket.on('addFriend', (friendData) => {
        if (!friends[socket.id]) {
            friends[socket.id] = [];
        }
        friends[socket.id].push(friendData.friendId);
        socket.emit('friendAdded', friendData.friendId);
    });

    socket.on('removeFriend', (friendData) => {
        if (friends[socket.id]) {
            friends[socket.id] = friends[socket.id].filter(id => id !== friendData.friendId);
            socket.emit('friendRemoved', friendData.friendId);
        }
    });
}

module.exports = { init };
