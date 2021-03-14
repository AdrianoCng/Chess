const { Chess } = require("chess.js");

const makeMove = (chess, { piece, source, target }) => {
    return chess.move({
        color: piece[0],
        from: source,
        to: target,
        piece: piece[1],
        promotion: "q"
    });
};

const getResult = (chess) => {
    if (chess.in_checkmate()) {
        return `${chess.turn() === "b" ? "White" : "Black"} Wins!`;
    }

    if (chess.in_stalemate()) {
        return `${chess.turn() === "b" ? "Black" : "White"} has been stalemated!`;
    }

    if (chess.insufficient_material()) {
        return "Draw due to insufficient material"
    }

    if (chess.in_draw()) {
        return "Draw!";
    }
}

module.exports = { makeMove, Chess, getResult };