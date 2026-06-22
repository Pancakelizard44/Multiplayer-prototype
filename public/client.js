const socket = io();

function setUp() {
    createCanvas(800,800)
}

let players = {};

socket.on("currentPlayers", (serverPlayers) => {
    players = serverPlayers;
});

socket.on("newPlayer", (data) => {
    players[data.id] = data.player;
});

socket.on("updatePlayers", (serverPlayers) => {
    players = serverPlayers;
});

// Movement
document.addEventListener("keydown", (e) => {
    let move = { x: 0, y: 0 };

    if (e.key === "w") move.y = -5;
    if (e.key === "s") move.y = 5;
    if (e.key === "a") move.x = -5;
    if (e.key === "d") move.x = 5;

    socket.emit("move", move);
});

// Draw loop
function draw() {
   background(200)
    

    for (let id = 0; id < players.length; i++) {
        let p = players[id];

        ctx.fillStyle = (id === socket.id) ? "blue" : "red";
        square(p.x, p.y, 20);
        
    }
}

