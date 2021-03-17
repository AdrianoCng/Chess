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
    onDragStart
};