function onDrop(source, target, piece, newPos, oldPos, orientation) {
    const move = {
        source,
        target,
        piece,
        newPos,
        oldPos,
        orientation,
    };

    socket.emit("move", move);
}

function onDragStart(source, piece, position, orientation) {
    if (
        (orientation === "white" && piece.search(/^w/) === -1) ||
        (orientation === "black" && piece.search(/^b/) === -1)
    ) {
        return false;
    }
}


const boardConfig = {
    draggable: true,
    position: "start",
    onDrop,
    onDragStart,
};

// Initialize chessboard
const board = new Chessboard("board", boardConfig);

// Create roomID if not exist
const roomID = location.hash
    ? location.hash
    : "#" + Math.floor(Math.random() * 1000) + Date.now().toString();

location.hash = roomID;

const socket = io();

socket.emit("join", roomID);

socket.on("orientation", (color) => {
    board.orientation(color);
})

// newPos and oldPos are FEN string from chess.fen() on the back end
socket.on("move", (newPos) => {
    board.position(newPos);
});
socket.on("invalid move", (oldPos) => {
    board.position(oldPos);
});

socket.on("gameover", (msg) => console.log(msg));

socket.on("full", () => {
    board.destroy();
    document.body.innerHTML = "Error - The game is already full"
})
