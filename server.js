const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const http = require("http");
// Game Logic Functions
const { Chess, makeMove, isGameOver } = require("./game");

const app = express();

const server = http.createServer(app);

const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/board", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "board.html"));
});

let games = [];

io.on("connection", (socket) => {
    socket.on("join", (roomID) => {
        socket.join(roomID);

        if (games.findIndex((game) => game.roomID === roomID) === -1) {
            const game = {
                roomID,
                chess: new Chess(),
                players: [{
                    color: "white",
                    id: socket.id
                }]
            };

            games.push(game);
        }

        const { chess, players } = games.find((game) => game.roomID === roomID);

        if (players.length < 2 && players.findIndex(player => player.id === socket.id) === -1) {
            players.push({
                color: "black",
                id: socket.id
            })
        } else if (players.length >= 2) {
            socket.emit("full");
            socket.disconnect();
        };

        players.forEach(({ color, id }) => {
            io.to(id).emit("orientation", color);
        })

        io.to(roomID).emit("move", chess.fen());

        socket.on("move", (move) => {
            if (makeMove(chess, move)) {
                io.to(roomID).emit("move", chess.fen());

                if (isGameOver(chess, chess.fen())) {
                    io.to(roomID).emit("gameover", "is gameOver");
                }
            } else {
                socket.emit("invalid move", chess.fen());
            }
        });
    });
});

const PORT = 3000 | process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
