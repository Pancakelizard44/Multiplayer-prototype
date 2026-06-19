const socket = io();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        let p = players[id];

        ctx.fillStyle = (id === socket.id) ? "blue" : "red";
        ctx.fillRect(p.x, p.y, 20, 20);
    }

    requestAnimationFrame(draw);
}

draw();
