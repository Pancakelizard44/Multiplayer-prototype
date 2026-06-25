const socket = io();

function setup() {
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

    if (e.key === "w") {inputY = -1}
    if (e.key === "s") {inputY = 1}

    socket.emit("moveY", inputY);
});

document.addEventListener("keydown", (e) => {

    if (e.key === "a") {inputX = -1}
    if (e.key === "d") {inputX = 1}

    socket.emit("moveX", inputX);
});

document.addEventListener("keyup", (e) => {

    if (e.key === "w") {inputY = 0}
    if (e.key === "s") {inputY = 0}

    socket.emit("moveY", inputY);
});

document.addEventListener("keyup", (e) => {

    if (e.key === "a") {inputX = 0}
    if (e.key === "d") {inputX = 0}

    socket.emit("moveX", inputX);
});

// Draw loop
function draw() {

   background(200)
    
    for (let id in players) {
        let p = players[id];
            fill("red")
        square(p.x, p.y, 20);
    }
}
