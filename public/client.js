const socket = io();
const mapSize = 6
let cellSize
let inputY = 0
let inputX = 0
let myMap = []
let img
let mapImages = []
let lights

async function setup() {
    mapImages[0] = await loadImage("images/floor.png")
    mapImages[1] = await loadImage("images/wallTop.png")
    mapImages[2] = await loadImage("images/wallSide.png")
    createCanvas(windowWidth,windowHeight)
    initLevel()
    angleMode(DEGREES)
}

function initLevel(){
    cellSize = floor(min(width / (mapSize + 2), height / (mapSize + 2)));
    ellipseMode(CENTER)
    lights = true
}

let players = {}
let enemies = {}

socket.on("updateMap", (data) => {
    myMap = data
    console.log("Map is loaded")
});

socket.on("currentPlayers", (serverPlayers) => {
    players = serverPlayers
});

socket.on("newPlayer", (data) => {
    players[data.id] = data.player
});

socket.on("updatePlayers", (serverPlayers, serverEnemies) => {
    players = serverPlayers
    enemies = serverEnemies
});

// Movement
document.addEventListener("keydown", (e) => {

    if (e.key === "w" || e.key === "ArrowUp") {inputY = -1}
    if (e.key === "s" || e.key === "ArrowDown") {inputY = 1}
    if (e.key === "a" || e.key === "ArrowLeft") {inputX = -1}
    if (e.key === "d" || e.key === "ArrowRight") {inputX = 1}

    socket.emit("moveY", inputY)
    socket.emit("moveX", inputX)
});

document.addEventListener("keyup", (e) => {

    if ((e.key === "w" || e.key === "ArrowUp") && inputY < 0) {inputY = 0}
    if ((e.key === "s" || e.key === "ArrowDown") && inputY > 0) {inputY = 0}
    if ((e.key === "a" || e.key === "ArrowLeft") && inputX < 0) {inputX = 0}
    if ((e.key === "d" || e.key === "ArrowRight") && inputX > 0) {inputX = 0}

    socket.emit("moveY", inputY)
    socket.emit("moveX", inputX)
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

        if(!lights){
        fill(0,0,0,200)
        let mouseAngle = atan2((mouseY - height/2),(mouseX - width/2))
        arc(width/2,height/2,width * 2,width * 2,mouseAngle + 40,mouseAngle - 40)
        }
    }

}

function drawWorld() { 
    strokeWeight(0)
    for (let j = Math.round(thisPlayer.x - mapSize * 1.5); j < Math.round(thisPlayer.x + mapSize * 1.5); j++) {
        if(j < 0){j = 0}
        for(let i = Math.round(thisPlayer.y) - mapSize; i < Math.round(thisPlayer.y) + mapSize; i++){
            if(i < 0){i = 0}
            switch (myMap[i][j]) {
            case 0:
                fill(200);
                img = 0
                break;
            case 1:
                fill(50);
                img = 1
                break;
            case 2:
                fill("gray");
                img = 2
                break;
            default:
                console.log("ERROR the map is not loading properly")
                break;
            }
            image(mapImages[img], j * cellSize - 1, i * cellSize - 1, cellSize + 2,cellSize + 2)
        }
    }

    drawPlayers()
    drawEnemies()
}

function drawPlayers() {
    strokeWeight(3)
    for (let id in players) {
        let p = players[id];
        fill("red")
        circle(p.x * cellSize, p.y * cellSize, cellSize);
    }
}

function drawEnemies() {
    strokeWeight(3)
    for (let id in enemies) {
        let p = enemies[id];
        fill("red")
        circle(p.x * cellSize, p.y * cellSize, cellSize);
    }
}
