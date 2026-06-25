const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

class serverPlayer {
        constructor(x, y, v, id) {
        this.id = id
        this.x = x
        this.y = y
        this.v = v
        this.xv = 0
        this.yv = 0
    }
}

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // Create player
    players[socket.id] = new serverPlayer(5,5, 0.05 ,socket.id)

    // Send all players to new client
    socket.emit("currentPlayers", players);

    // Tell others about new player
    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        player: players[socket.id]
    });

    // Movement update
    socket.on("moveX", (data) => {

        if (players[socket.id]) {
            players[socket.id].vx = data * players[socket.id].v
        }
    });
        socket.on("moveY", (data) => {
        if (players[socket.id]) {
            players[socket.id].vy = data * players[socket.id].v
        }
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

function tickUpdates(){
    for(let id in players){
        let i = players[id]

        i.x += i.vx || 0
        i.y += i.vy || 0
    }

    io.emit("updatePlayers", players)
}

setInterval(tickUpdates,16);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running");
});

