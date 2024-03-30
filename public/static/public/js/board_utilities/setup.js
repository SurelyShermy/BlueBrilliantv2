
//This Piece implementation is adapted from the following source: https://youtu.be/U4ogK0MIzqk?t=82

//It takes advantage of bit representations of pieces on the board to make the game more efficient. 

/*
Lets take a look at it like this:

The designation for a king is 1
0000001 = king

and a designation for white is 16
0010000 = white
We can then do a bitwise or operation | to get the following:
0010001 = white king!
0011111
//Liam was here

so we should be able to declare pieces as follows:
square  = piece.white | piece.king

*/
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
    [pieceBitRep.white | pieceBitRep.king]: "../static/public/images/chessPieces/white/K.svg",
    [pieceBitRep.white | pieceBitRep.pawn]: "../static/public/images/chessPieces/white/P.svg",
    [pieceBitRep.white | pieceBitRep.knight]: "../static/public/images/chessPieces/white/N.svg",
    [pieceBitRep.white | pieceBitRep.bishop]: "../static/public/images/chessPieces/white/B.svg",
    [pieceBitRep.white | pieceBitRep.rook]: "../static/public/images/chessPieces/white/R.svg",
    [pieceBitRep.white | pieceBitRep.queen]: "../static/public/images/chessPieces/white/Q.svg",
    [pieceBitRep.black | pieceBitRep.king]: "../static/public/images/chessPieces/black/k.svg",
    [pieceBitRep.black | pieceBitRep.pawn]: "../static/public/images/chessPieces/black/p.svg",
    [pieceBitRep.black | pieceBitRep.knight]: "../static/public/images/chessPieces/black/n.svg",
    [pieceBitRep.black | pieceBitRep.bishop]: "../static/public/images/chessPieces/black/b.svg",
    [pieceBitRep.black | pieceBitRep.rook]: "../static/public/images/chessPieces/black/r.svg",
    [pieceBitRep.black | pieceBitRep.queen]: "../static/public/images/chessPieces/black/q.svg"
};
var move = {
    fromIndex: 0,
    toIndex: 0,
}
const directions = {
    NW : 15,
    NE : 17,
    N : 16,
    S : -16,
    SW : -17,
    SE : -15,
    E : 1,
    W : -1,
    knightmoves : [33, 31, 18, 14, -33, -31, -18, -14],
};
function onBoard(index) {
    if(index < 0){
        return false;
    }
    let sum = (index & 0x88);
    if (sum == 0) {
        return true;
    }
    return false;
}
//This converts the 0x88 index to the 0-63 index
function toDecIndex(index) {
    let newIndex = (index + (index & 7)) >> 1;
    return newIndex;
}
//This converts the  0-63 index to the 0x88 index
function toHexIndex(index) {
    let newIndex = (index + (index & ~7))
    return newIndex;
}
var boardState = new Array(64).fill(0);
var gameState = {
    //0 Indicates white to move, 1 indicates black to move
    id: 0,
    turn: 0,
    //Grabbing the boardstate form board.js
    //1D array numbered from 0 - 63
    board : boardState,
    // check : false,
    //If the king is in check, this will be populated with the squares that are causing check
    //Specifically, the square that the checking piece is attacking from, if double check, this will contain both squares
    // checkingSquares : [],
    // checkmate : false,
    // stalemate : false,
    //Will contain the square that can be captured enpassant
    // enpassant : null,
    // For the fifty-move rule. It counts the number of half-moves since the last capture or pawn move, which can be used to determine draw conditions.
    // pinnedPieces: [],
    // passedPawns: [],
    // isolatedPawns: [],
    // doubledPawns: [],

    // pinners : [],
    //The number of full moves made in the game
    //This determines if the players have agreed to play with time increments per move
    timeIncrementOn : false,
    //This will be used to determine if castling is possible and on which side its possible to do so
    // castlingBlack :{
    //     king : true,
    //     queen : true
    // },
    // castlingWhite : {
    //     king : true,
    //     queen : true
    // },
    // whiteKingPos : 4,
    // blackKingPos : 0x74,
    //This stores only the last move made, makes it easy to send move orders up to the DB
    // lastMove : new Array(4).fill(0),
    //Store all moves that have been made in normal chess notation, this should be sent
    // moveHistory : [],
    // positionHistory : [],
    // capturedPiece : 0,
    // guest : false,

    //0 indicates black win, 1 indicates white win, .5 indicates draw, null indicates game is still in progress
    // result : null,
    // gamePhase : 24,
    // //Engine Considerations
    enginePlayingWhite : false,
    enginePlayingBlack : false,
    engine : false,
    // randomMoves : false,
    // whiteAttackTable: Array(64).fill(null).map(() => []),
    // blackAttackTable: Array(64).fill(null).map(() => []),

};


/*
OK so maybe this isnt the best way to do this but I figured hardcoding the initial position is probably for the best.

TODO: Need to see if its possible to put 0 at the bottom left rather than the top left, sides need to be swapped if this is done
TODO: Add flip board button
*/

//We will proceed by intializing the board to the starting position
boardState[0] = pieceBitRep.white | pieceBitRep.rook;
boardState[1] = pieceBitRep.white | pieceBitRep.knight;
boardState[2] = pieceBitRep.white | pieceBitRep.bishop;
boardState[3] = pieceBitRep.white | pieceBitRep.queen;
boardState[4] = pieceBitRep.white | pieceBitRep.king;
boardState[5] = pieceBitRep.white | pieceBitRep.bishop;
boardState[6] = pieceBitRep.white | pieceBitRep.knight;
boardState[7] = pieceBitRep.white | pieceBitRep.rook;
for (let i = 8; i < 16; i++) {
    boardState[i] = pieceBitRep.white | pieceBitRep.pawn;
}
for (let i = 48; i < 56; i++) {
    boardState[i] = pieceBitRep.black | pieceBitRep.pawn;
}
boardState[56] = pieceBitRep.black | pieceBitRep.rook;
boardState[57] = pieceBitRep.black | pieceBitRep.knight;
boardState[58] = pieceBitRep.black | pieceBitRep.bishop;
boardState[59] = pieceBitRep.black | pieceBitRep.queen;
boardState[60] = pieceBitRep.black | pieceBitRep.king;
boardState[61] = pieceBitRep.black | pieceBitRep.bishop;
boardState[62] = pieceBitRep.black | pieceBitRep.knight;
boardState[63] = pieceBitRep.black | pieceBitRep.rook;

const chessBoard = document.getElementById("chessBoard");
function getFile(index){
    let ret = index & 7;
    return ret
}
function getRank(index){
    let ret = index >> 3;
    return ret
}
const notationMapping = {
    a : 0,
    b : 1,
    c : 2,
    d : 3,
    e : 4,
    f : 5,
    g : 6,
    h : 7,
    1 : 0,
    2 : 1,
    3 : 2,
    4 : 3,
    5 : 4,
    6 : 5,
    7 : 6,
    8 : 7
}
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1','2','3','4','5','6','7','8'];
//Populating the Board

for(let i = 8; i > 0; i--){
    let start = (i-1) * 8;
    let end = (i * 8)-1;
    while(start <= end){
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${start}`;
        if (Math.floor(start / 8) % 2 === 0) {
            cell.className += (start % 2 === 0) ? ' dark' : ' light';
          } else {
            cell.className += (start % 2 === 0) ? ' light' : ' dark';
        }
        let squareNotation = "";
        squareNotation = squareNotation.concat(files[getFile(start)]);
        squareNotation = squareNotation.concat(ranks[(getRank(start))]);
        cell.setAttribute('data-notation', squareNotation);
        piece = boardState[start];
        if (piece !== 0) {
            const img = document.createElement('img');
            img.src = svgPaths[piece];
            cell.appendChild(img);
        }
      chessBoard.appendChild(cell);
      start++;
    }
}
gameState.board = boardState;
console.log(gameState.board)