import React from 'react';
class pieceBitRep {
    static none = 0;
    static king = 1;
    static pawn = 2;
    static knight = 3;
    static bishop = 4;
    static rook = 5;
    static queen = 6;
    static white = 8;
    static black = 16;
  }
// 00000001
const svgPaths = {
    [pieceBitRep.white | pieceBitRep.king]: "/chessPieces/white/K.svg",
    [pieceBitRep.white | pieceBitRep.pawn]: "/chessPieces/white/P.svg",
    [pieceBitRep.white | pieceBitRep.knight]: "/chessPieces/white/N.svg",
    [pieceBitRep.white | pieceBitRep.bishop]: "/chessPieces/white/B.svg",
    [pieceBitRep.white | pieceBitRep.rook]: "/chessPieces/white/R.svg",
    [pieceBitRep.white | pieceBitRep.queen]: "/chessPieces/white/Q.svg",
    [pieceBitRep.black | pieceBitRep.king]: "/chessPieces/black/k.svg",
    [pieceBitRep.black | pieceBitRep.pawn]: "/chessPieces/black/p.svg",
    [pieceBitRep.black | pieceBitRep.knight]: "/chessPieces/black/n.svg",
    [pieceBitRep.black | pieceBitRep.bishop]: "/chessPieces/black/b.svg",
    [pieceBitRep.black | pieceBitRep.rook]: "/chessPieces/black/r.svg",
    [pieceBitRep.black | pieceBitRep.queen]: "/chessPieces/black/q.svg"
};
const getPieceImage = (piece) => {
    return svgPaths[piece];
};
const ChessSquare = ({ piece, position, onSelectSquare, onDragStart, onDragOver, onDrop, dragging, dragPosition, isSelected, legalMoves }) => {
    let classname = 'cell'
    if (Math.floor(position / 8) % 2 === 0) {
        classname += (position % 2 === 0) ? ' dark' : ' light';
      } else {
        classname += (position % 2 === 0) ? ' light' : ' dark';
    }
    if(legalMoves.includes(position)){
      classname += " highlight"
    }
    return (
      <div
        className={classname}
        onClick={() => onSelectSquare(position)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, position)}
      >
        {piece !== 0 && (
          <img
            src={getPieceImage(piece)}
            draggable="true"
            className = {`grabbable ${dragging ? 'dragging' : ''}`}
            style={dragging ? { position: 'fixed', left: dragPosition.x, top: dragPosition.y, pointerEvents: 'none' } : {}}
            onDragStart={(e) => onDragStart(e, position)}
            onDragEnd={onDrop}
          />
        )}
      </div>
    );
  };
  export default ChessSquare;