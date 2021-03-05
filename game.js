const { Chess } = require("chess.js");

const makeMove = (chess, { piece, source, target }) => {
    return chess.move({
        color: piece[0],
        from: source,
        to: target,
        piece: piece[1],
    });
};

const isGameOver = (chess, fen) => {
    chess.load(fen);
    return chess.game_over();
};

module.exports = { makeMove, isGameOver, Chess };
