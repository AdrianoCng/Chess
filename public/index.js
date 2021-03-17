function highlightSquare(target, source) {
    $("div[class^='square']").each(function () {
        $(this).removeClass("highlight-target")
        $(this).removeClass("highlight-source")
    });

    if (target && source) {
        $(`.square-${target}`).addClass("highlight-target");
        $(`.square-${source}`).addClass("highlight-source");
    }
}

// Initialize chessboard
const board = new Chessboard("board", boardConfig);

// Create roomID if not exist
const roomID = location.hash
    ? location.hash
    : "#" + Math.floor(Math.random() * 1000) + Date.now().toString();

location.hash = roomID;

const socket = io();

socket.emit("join", roomID, (newPos, target, source) => {
    board.position(newPos);
    highlightSquare(target, source)
});

socket.on("orientation", (color) => {
    board.orientation(color);
});

// newPos and oldPos are FEN string from chess.fen() on the back end
socket.on("move", ({ newPos, source, target }) => {
    board.position(newPos);

    // highlight last move
    highlightSquare(target, source);
});

socket.on("invalid move", (oldPos) => {
    board.position(oldPos);
});

socket.on("gameover", (msg) => {
    $(".modal > h1").html(msg)
    $(".modal").css("display", "flex");
});

socket.on("full", () => {
    board.destroy();
    document.body.innerHTML = "Error - The game is already full"
});

// When the play again button is clicked it sends a "reset" event to the server
// The server will reset the chess instance and send a "reset" event to all the clients in the rooms
$("#reset").on("click", () => {
    socket.emit("reset");
})

// When the client receive the "reset" event the board will be resetted to the initial position
socket.on("reset", () => {
    board.start();
    $(".modal").css("display", "none");
})