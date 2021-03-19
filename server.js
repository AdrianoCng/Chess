const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const http = require("http");
// Game Logic Functions
const { Chess, makeMove, getResult, getLastMove } = require("./game");

const app = express();

const server = http.createServer(app);

const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/board", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "board.html"));
});

let games = [];

io.on("connection", (socket) => {
    socket.on("join", (roomID, updateBoardPosition) => {
        socket.join(roomID);

        // Create a room in games: [] if doesn't exist already
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

        // Relevant chess instance
        const { chess, players } = games.find((game) => game.roomID === roomID);

        // the user who is trying to join is disconnected if two players already in the same room
        if (players.length < 2 && players.findIndex(player => player.id === socket.id) === -1) {
            players.push({
                color: "black",
                id: socket.id
            });

            io.to(socket.id).emit("orientation", "black")
        } else if (players.length >= 2) {
            socket.emit("full");
            socket.disconnect();
        };

        const lastMove = getLastMove(chess);

        updateBoardPosition(chess.fen(), lastMove.to, lastMove.from, chess.turn());

        io.to(roomID).emit("turn", chess.turn());

        socket.on("move", (move) => {
            if (makeMove(chess, move)) {
                const newMove = {
                    newPos: chess.fen(),
                    source: move.source,
                    target: move.target
                };

                io.to(roomID).emit("move", newMove);
                io.to(roomID).emit("turn", chess.turn());

                if (chess.game_over()) {
                    io.to(roomID).emit("gameover", getResult(chess))
                }
            } else {
                socket.emit("invalid move", chess.fen());
            }
        });

        socket.on("reset", () => {
            chess.reset();
            io.to(roomID).emit("reset");

            // Swap colors
            players.forEach(({ color, id }) => {
                const newColor = color === "white" ? "black" : "white";
                io.to(id).emit("orientation", newColor);
            });
        });

        socket.on("undo", (orientation) => {
            const turn = chess.turn();

            // Only allow to undo opponent moves
            if ((turn === "w" && orientation === "white") || (turn === "b" && orientation === "black")) {
                chess.undo();

                const { from, to } = getLastMove(chess);

                io.to(roomID).emit("undo", chess.fen(), to, from, chess.turn())
            }
        })

    });
});

const PORT = 3000 | process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
