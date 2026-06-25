const socket = io();
const mapSize = 20
let cellSize

function setup() {
    createCanvas(windowWidth,windowHeight)
    initLevel()
}

function initLevel(){
    cellSize = floor(min(width / (mapSize + 2), height / (mapSize + 2)));
    ellipseMode(CENTER)
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
    inputY = 0
    if (e.key === "w") {inputY = -1}
    if (e.key === "s") {inputY = 1}

    socket.emit("moveY", inputY);
});

document.addEventListener("keydown", (e) => {
    inputX = 0
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

    if(players[socket.id]){
        thisPlayer = players[socket.id]
        camX = thisPlayer.x * cellSize
        camY = thisPlayer.y * cellSize
    
    
        push()
        translate(width/2 - camX, height/2 - camY)
        drawWorld()
        pop()

        fill("blue")
        
        circle(width/2,height/2, cellSize)
    }
    
   // for (let id in players) {
        //let p = players[id];
            //fill("red")
        //square(p.x * cellSize, p.y * cellSize, cellSize);
    //}
}

function drawWorld() {
    for (let id in players) {
        let p = players[id];
        fill("red")
        circle(p.x * cellSize, p.y * cellSize, cellSize);
    }
}
