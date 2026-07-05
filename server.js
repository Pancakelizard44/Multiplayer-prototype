const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
let map = []
const app = express()
const server = http.createServer(app)
const io = socketIO(server)


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
        let deltaX = 0
        let deltaY = 0
        let distance = this.range

        for (let id in players) {
            distance = this.range

            let tempX = players[id].x - this.x
            let tempY = players[id].y - this.y
            let tempD = Math.sqrt(tempX ** 2 + tempY ** 2)

            if (tempD < distance) {
                distance = tempD
                deltaX = tempX
                deltaY = tempY
                let target = id
            }
        }

        if (deltaX && deltaY) {
            let moveX = deltaX * (this.v / distance)
            if (deltaX < 0) { moveX * -1 }

            let moveY = deltaY * (this.v / distance)
            if (deltaY < 0) { moveY * -1 }

            this.xv = moveX
            this.yv = moveY
        }
    }
}

function isWall(x,y){
    x = Math.floor(x)
    y = Math.floor(y)
if(map[y][x] === 1 || map[y][x] === 2) {return true}
        return false
}

app.use(express.static("public"))

let players = {}
let enemies = {}
enemies[1] = new serverEnemy(8,4.5,0.03,5)

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

    socket.on("myMap", (data) =>{
        map = data
    });
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
