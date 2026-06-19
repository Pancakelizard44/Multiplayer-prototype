const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // Create player
    players[socket.id] = {
        x: 100,
        y: 100
    };

    // Send all players to new client
    socket.emit("currentPlayers", players);

    // Tell others about new player
    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        player: players[socket.id]
    });

    // Movement update
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x += data.x;
            players[socket.id].y += data.y;

            io.emit("updatePlayers", players);
        }
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
