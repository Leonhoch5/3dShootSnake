const socket = io();

let players = {};

document.getElementById('createAccountButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    socket.emit('createAccount', { username, password });
});

document.getElementById('loginButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    socket.emit('login', { username, password });
});

document.getElementById('joinLobbyButton').addEventListener('click', () => {
    const lobbyId = prompt('Enter lobby ID:');
    socket.emit('joinLobby', lobbyId);
});

document.getElementById('leaveLobbyButton').addEventListener('click', () => {
    const lobbyId = prompt('Enter lobby ID:');
    socket.emit('leaveLobby', lobbyId);
});

document.getElementById('addFriendButton').addEventListener('click', () => {
    const friendId = document.getElementById('friendId').value;
    socket.emit('addFriend', { friendId });
});

document.getElementById('removeFriendButton').addEventListener('click', () => {
    const friendId = document.getElementById('friendId').value;
    socket.emit('removeFriend', { friendId });
});

socket.on('accountCreated', (accountData) => {
    console.log('Account created:', accountData);
});

socket.on('loginSuccess', (accountData) => {
    console.log('Login success:', accountData);
    document.getElementById('accountContainer').style.display = 'none';
    document.getElementById('lobbyContainer').style.display = 'block';
    document.getElementById('friendContainer').style.display = 'block';
});

socket.on('loginFailure', () => {
    alert('Login failed!');
});

socket.on('lobbyUpdate', (lobbyPlayers) => {
    document.getElementById('lobbyStatus').innerText = `Lobby players: ${lobbyPlayers.join(', ')}`;
});

socket.on('friendAdded', (friendId) => {
    const friendList = document.getElementById('friendList');
    friendList.innerHTML += `<div id="friend-${friendId}">${friendId}</div>`;
});

socket.on('friendRemoved', (friendId) => {
    const friendElement = document.getElementById(`friend-${friendId}`);
    if (friendElement) {
        friendElement.remove();
    }
});

socket.on('currentPlayers', (currentPlayers) => {
    players = currentPlayers;
    Object.keys(players).forEach((id) => {
        if (id !== socket.id) {
            createPlayerObject(players[id]);
        }
    });
});

socket.on('newPlayer', (newPlayer) => {
    createPlayerObject(newPlayer);
});

socket.on('playerDisconnected', (playerId) => {
    const playerObject = players[playerId].object;
    if (playerObject) {
        scene.remove(playerObject);
    }
    delete players[playerId];
});

socket.on('playerMoved', (playerData) => {
    const playerObject = players[playerData.id].object;
    if (playerObject) {
        playerObject.position.set(playerData.position.x, playerData.position.y, playerData.position.z);
    }
});

socket.on('build', (buildData) => {
    createBuildObject(buildData.position);
});

socket.on('shoot', (shootData) => {
    console.log('Player shot at', shootData.position);
});

// Create the player object in the 3D scene
function createPlayerObject(player) {
    const playerGeometry = new THREE.BoxGeometry();
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const playerCube = new THREE.Mesh(playerGeometry, playerMaterial);
    scene.add(playerCube);
    playerCube.position.set(player.position.x, player.position.y, player.position.z);
    players[player.id].object = playerCube;
}

// Create the build object in the 3D scene
function createBuildObject(position) {
    const buildGeometry = new THREE.BoxGeometry();
    const buildMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const buildCube = new THREE.Mesh(buildGeometry, buildMaterial);
    buildCube.position.set(position.x, position.y, position.z);
    scene.add(buildCube);
}

// 3D rendering setup with Three.js
let scene, camera, renderer;
init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    camera.position.z = 5;

    document.addEventListener('keydown', onKeyDown);
}

function onKeyDown(event) {
    switch(event.keyCode) {
        case 87: // W
            movePlayer(0, 0.1, 0);
            break;
        case 83: // S
            movePlayer(0, -0.1, 0);
            break;
        case 65: // A
            movePlayer(-0.1, 0, 0);
            break;
        case 68: // D
            movePlayer(0.1, 0, 0);
            break;
        case 66: // B
            build();
            break;
        case 32: // Space
            shoot();
            break;
    }
}

function movePlayer(x, y, z) {
    if (players[socket.id]) {
        players[socket.id].position.x += x;
        players[socket.id].position.y += y;
        players[socket.id].position.z += z;
        socket.emit('playerMovement', { position: players[socket.id].position, rotation: players[socket.id].rotation });
    }
}

function build() {
    if (players[socket.id]) {
        socket.emit('build', { position: players[socket.id].position });
    }
}

function shoot() {
    if (players[socket.id]) {
        socket.emit('shoot', { position: players[socket.id].position });
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
