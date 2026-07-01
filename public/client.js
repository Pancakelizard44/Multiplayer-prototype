const socket = io();
const mapSize = 20
let cellSize
let inputY = 0
let inputX = 0


function setup() {
    createCanvas(windowWidth,windowHeight)
    initLevel()
}

function initLevel(){
    cellSize = floor(min(width / (mapSize + 2), height / (mapSize + 2)));
    ellipseMode(CENTER)

        //0=floor 1=walltop 2=wallside
    map = [
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 0, 0, 0, 2, 2, 2],
        [2, 2, 2, 0, 0, 0, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
    ]
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
    if (e.key === "a") {inputX = -1}
    if (e.key === "d") {inputX = 1}

    socket.emit("moveY", inputY);
    socket.emit("moveX", inputX);
});

document.addEventListener("keyup", (e) => {

    if (e.key === "w") {inputY = 0}
    if (e.key === "s") {inputY = 0}
    if (e.key === "a") {inputX = 0}
    if (e.key === "d") {inputX = 0}

    socket.emit("moveY", inputY);
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
}

function drawWorld() {
        strokeWeight(0)
        for (let j = 0; j <= 8; j++) {
            for(let i = 0; i<=8;i++){
            switch (map[i][j]) {
                case 0:
                    fill(200);
                    break;
                case 1:
                    fill(50);
                    break;
                case 2:
                    fill("gray");
                    break;
                default:
                    console.log("ERROR the map is not loading properly")
                    break;
            
            }
            square(j * cellSize, i * cellSize, cellSize)
            }
            }
            strokeWeight(3)
    for (let id in players) {
        let p = players[id];
        fill("red")
        circle(p.x * cellSize, p.y * cellSize, cellSize);
    }
}
