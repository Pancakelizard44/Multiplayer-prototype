const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
let map = []
const app = express()
const server = http.createServer(app)
const io = socketIO(server)
let distance 
let dx
let dy

class serverPlayer {
        constructor(x, y, v, id) {
        this.id = id
        this.x = x
        this.y = y
        this.v = v
        this.xv = 0
        this.yv = 0
    }

        checkTarget(){
                
                if(this.xv > 0 && (isWall(this.x + 0.55, this.y + 0.5) || isWall(this.x + 0.55, this.y - 0.5))) {
                        this.xv = 0
                } else if(this.xv < 0 && (isWall(this.x - 0.55, this.y + 0.5) || isWall(this.x - 0.55, this.y - 0.5))) {
                        this.xv = 0
                }
                
                if(this.yv > 0 && (isWall(this.x + 0.5,this.y + 0.55) || isWall(this.x - 0.5,this.y + 0.55))) {
                        this.yv = 0
                } else if(this.yv < 0 && (isWall(this.x + 0.5,this.y - 0.55) || isWall(this.x - 0.5,this.y - 0.55))) {
                        this.yv = 0 
                }
        }
}

class serverEnemy {
    constructor(x, y, v, range) {
        this.x = x
        this.y = y
        this.v = v
        this.xv = 0
        this.yv = 0
        this.range = range
    }

    updateEnemy() {
        distance = this.range

        for(let id in players) {
            let distance2 = absDistance(this.x,this.y,players[id].x,players[id].y)
            if(distance2 < distance) {
                distance = distance2
                dx = this.x - players[id].x
                dy = this.y - players[id].y
            }
        }
        if(distance < this.range) {
            this.attack(dx,dy,distance)
        } else {
            this.roam()
        }
    }

    attack(dx,dy,d){
        let moveX = dx * (this.v / d)

        let moveY = dy * (this.v / d)

        if((isWall(this.x,this.y + 1) && this.yv >= 0) || (isWall(this.x, this.y - 1) && this.yv <= 0)){
            if(moveX > 0){
                this.xv = this.v * -1
                this.yv = 0
            } else {
                this.xv = this.v
                this.yv = 0
            }
        } else if((isWall(this.x + 1,this.y) && this.xv >= 0) || (isWall(this.x - 1, this.y) && this.xv <= 0)){
            if(moveY > 0) {
                this.yv = this.v * -1
                this.xv = 0
            } else {
                this.yv = this.v
                this.xv = 0
            }
        } else {
        this.xv = moveX * -1
        this.yv = moveY * -1
        }
    }

    roam() {
        this.xv = 0
        this.yv = 0
    }
}

class item {
    constructor(x,y,type){
        this.x = x
        this.y = y
        this.type = type
        this.player
    }


}

function isWall(x,y){
    x = Math.floor(x)
    y = Math.floor(y)
    if(myMap[y][x] === 1 || myMap[y][x] === 2) {return true}
    return false
}

function absDistance(x1,y1,x2,y2) {
    return Math.sqrt((x1-x2) ** 2 + (y1-y2) ** 2)
}

app.use(express.static("public"))

let players = {}
let enemies = {}
enemies[1] = new serverEnemy(12,4.5,0.03,5)

io.on("connection", (socket) => {

    console.log("Player connected:", socket.id)

    // Create player
    players[socket.id] = new serverPlayer(4.5,4.5, 0.05 ,socket.id)

    // Send all players to new client
    socket.emit("currentPlayers", players)

    // Tell others about new player
    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        player: players[socket.id]
    });

    // Movement update
    socket.on("moveX", (data) => {

        if (players[socket.id]) {
            players[socket.id].xv = data * players[socket.id].v
        }
    });
        socket.on("moveY", (data) => {
        if (players[socket.id]) {
            players[socket.id].yv = data * players[socket.id].v
        }
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id)
        delete players[socket.id]
        io.emit("updatePlayers", players)
    });

    socket.emit("updateMap", myMap)
});

setInterval(tickUpdates,16);

function tickUpdates(){
    for(let id in players){
        let i = players[id]
        i.checkTarget()

        i.x += i.xv
        i.y += i.yv 
    }
    for(let id in enemies){
        let i = enemies[id]
        i.updateEnemy()

        i.x += i.xv
        i.y += i.yv 
    }

    io.emit("updatePlayers", players, enemies)
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port ", PORT);
});

//map loading
let mapPresets = [
    // 0 = crossroads
    //1-4 = t junction variations
    //5-8 = L junction variation
    //9-10 = straight variations
    [
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 0, 0, 0, 2, 2, 2],
        [2, 2, 2, 0, 0, 0, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
    ],[
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
    ],[
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
    ],[
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 0, 0, 0, 2, 2, 2],
        [2, 2, 2, 0, 0, 0, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],[
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 2, 2, 2],
        [1, 1, 1, 0, 0, 0, 2, 2, 2],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],

    ],[
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
    ],[
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 2, 2, 2],
        [1, 1, 1, 0, 0, 0, 2, 2, 2],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],[
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],[
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
    ],[
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],[
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
]

let bigGrid = [
    [5,1,1,1,8],
    [4,0,0,0,2],
    [4,0,0,0,2],
    [4,0,0,0,2],
    [6,3,3,3,7],
]

function createArray(w,h,fill){
    let array = []
    for(let i = 0; i < h; i++){
        array[i] = []
        for(let j = 0; j < w; j++){
            array[i][j] = fill
        }
    }
    return array
}

function createMap() {
    myMap = createArray(bigGrid.length * 9, bigGrid.length * 9, 0)

    for(let i = 0; i < bigGrid.length; i ++) {
        for(let j = 0; j < bigGrid.length; j++){
            for(let k = 0; k < 9; k++){
                for(let l = 0; l < 9; l++){
                    myMap[k + 9 * i][l + 9 * j] = mapPresets[bigGrid[i][j]][k][l]
                }
            }
        }
    }
    console.log("map is loaded")
}

createMap()
