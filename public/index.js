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

const displayTurn = (turn) => {
    const imgSrc = `./img/chesspieces/wikipedia/${turn}P.png`
    $("#turn").html(`${turn === "w" ? "White" : "Black"} to move`);
    $("#sidebar img").attr("src", imgSrc);
}

const updateBoardPosition = (position, target, source, turn) => {
    board.position(position);
    highlightSquare(target, source);

    displayTurn(turn);
}

// Initialize chessboard
const board = new Chessboard("board", boardConfig);

// Create roomID if not exist
const roomID = location.hash
    ? location.hash
    : "#" + Math.floor(Math.random() * 1000) + Date.now().toString();

location.hash = roomID;

const socket = io();

socket.emit("join", roomID, updateBoardPosition);

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

socket.on("turn", displayTurn)

socket.on("full", () => {
    board.destroy();
    document.body.innerHTML = "Error - This link has expired"
});

// When the client receive the "reset" event the board will be resetted to the initial position
socket.on("reset", () => {
    board.start();
    $(".modal").css("display", "none");
})

socket.on("undo", updateBoardPosition)

// When the play again button is clicked it sends a "reset" event to the server
// The server will reset the chess instance and send a "reset" event to all the clients in the rooms
$("#reset").on("click", () => {
    socket.emit("reset");
})

$("#undo-button").on("click", () => {
    socket.emit("undo", board.orientation());
})