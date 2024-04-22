//Click Listner
//Test

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
let ws;
let username;
let playing_white;
let gameState = {
    board: null, // This should be a function that returns the initial board setup
    id: null,
    player1_id: null,
    player2_id: null,
    player1_color: null,
    player2_color: null,
    turn: null,
    board_array: [],
    engine: false
};
document.addEventListener('DOMContentLoaded', function() {
    const pathSegments = window.location.pathname.split('/');
    const gameId = pathSegments.pop() || pathSegments.pop();
    console.log(gameId)
    username = document.getElementById('userData').dataset.username;
    ws = new WebSocket(`ws://localhost:4000/ws/`+gameId);
    ws.onopen = () => {
        console.log('Connected to the server');
        initialize = {
            message_type: "Initialize",
            data: {
                game_id: gameId,
            }
        }
        ws.send(JSON.stringify(initialize));
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    };
    ws.onmessage = (event) => {
        let message = JSON.parse(event.data);
        console.log(message);
        if (message.message_type == "valid_moves") {
            validMoves = message.moves;
            console.log(validMoves);
            validMoves.forEach(index => {
                const cell = document.getElementById(`cell-${index}`);
                cell.classList.add('highlight');
            });
        }
        else if(message.message_type == "GameState"){
            updateGameState(message);
            if(gameState.engine === true){
                if(gameState.turn === false && playing_white === true){
                    requestEngineMove();
                }else if(gameState.turn === true && playing_white === false){
                    requestEngineMove();
                }
            }
        }
        
    };
    ws.onclose = () => {
        console.log("Disconnected from the game WebSocket");
    };
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
});
document.getElementById('forfeit').addEventListener('click', function(event) {
    event.preventDefault();
    ws.close();
    window.location.href = 'http://localhost:8080/userdashboard';
});
function updateGameState(message){
    gameState.board = message.board_array;
    gameState.turn = message.turn;
    gameState.id = message.game_id;
    gameState.player1_color = message.player1_color;
    gameState.player2_color = message.player2_color;
    gameState.player1_id = message.player1_id;
    gameState.player2_id = message.player2_id;
    gameState.engine = message.engine;
    updateDom();
    if (!playing_white){
        flipBoard();
    }
}

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
    [pieceBitRep.white | pieceBitRep.king]: "../../static/public/images/chessPieces/white/K.svg",
    [pieceBitRep.white | pieceBitRep.pawn]: "../../static/public/images/chessPieces/white/P.svg",
    [pieceBitRep.white | pieceBitRep.knight]: "../../static/public/images/chessPieces/white/N.svg",
    [pieceBitRep.white | pieceBitRep.bishop]: "../../static/public/images/chessPieces/white/B.svg",
    [pieceBitRep.white | pieceBitRep.rook]: "../../static/public/images/chessPieces/white/R.svg",
    [pieceBitRep.white | pieceBitRep.queen]: "../../static/public/images/chessPieces/white/Q.svg",
    [pieceBitRep.black | pieceBitRep.king]: "../../static/public/images/chessPieces/black/k.svg",
    [pieceBitRep.black | pieceBitRep.pawn]: "../../static/public/images/chessPieces/black/p.svg",
    [pieceBitRep.black | pieceBitRep.knight]: "../../static/public/images/chessPieces/black/n.svg",
    [pieceBitRep.black | pieceBitRep.bishop]: "../../static/public/images/chessPieces/black/b.svg",
    [pieceBitRep.black | pieceBitRep.rook]: "../../static/public/images/chessPieces/black/r.svg",
    [pieceBitRep.black | pieceBitRep.queen]: "../../static/public/images/chessPieces/black/q.svg"
};

var boardState = new Array(64).fill(0);
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




let promotionPosition;
let promotionPiece;
function updateGameState(message){
    gameState.board = message.board_array;
    gameState.turn = message.turn;
    gameState.id = message.game_id;
    gameState.player1_color = message.player1_color;
    gameState.player2_color = message.player2_color;
    gameState.player1_id = message.player1_id;
    gameState.player2_id = message.player2_id;
    gameState.engine = message.engine;
    if(username === gameState.player1_id){
        if(gameState.player1_color === true){
            playing_white = true;
        }else{
            playing_white = false;
        }
    }else if(username === gameState.player2_id){
        if(gameState.player2_color === true){
            playing_white = true;
        }else{
            playing_white = false;
        }
    }
    if(!playing_white){
        flipBoard();
    }
    updateDom();
}
function promptForPromotion(position, piece) {
    promotionPosition = position;
    promotionPiece = piece;
    document.getElementById("promotionModal").style.display = "block";
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
  }
function selectPromotionPiece(chosenPiece, resolve) {
    const color = promotionPiece ^ pieceBitRep.pawn;
    switch(chosenPiece) {
        case 'queen':
            gameState.board[promotionPosition] = color | pieceBitRep.queen;
            break;
        case 'rook':
            gameState.board[promotionPosition] = color | pieceBitRep.rook;
            break;
        case 'bishop':
            gameState.board[promotionPosition] = color | pieceBitRep.bishop;
            break;
        case 'knight':
            gameState.board[promotionPosition] = color | pieceBitRep.knight;
            break;
    }

    const cell = document.getElementById(`cell-${promotionPosition}`);
    const pawnImage = cell.querySelector('img');
    if (pawnImage) {
        cell.removeChild(pawnImage);
    } else {
        // console.log('No image found in the cell.');
    }
    const newPieceImg = document.createElement('img');
    newPieceImg.src = svgPaths[gameState.board[promotionPosition]];
    cell.appendChild(newPieceImg);
    // Close the modal
    document.getElementById("promotionModal").style.display = "none";
    resolve(chosenPiece);
}
function movePieceToNotation(pieceType, fromIndex, toIndex) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    // Convert indices to file and rank
    if(pieceType === pieceBitRep.king){
        if(Math.abs(fromIndex-toIndex) == 2 && fromIndex < toIndex){
            return "O-O";
        }else if(Math.abs(fromIndex-toIndex) == 2 && fromIndex > toIndex){
            return "O-O-O";
        }
    }
    const toFile = files[getFile(toIndex)];
    const toRank = ranks[getRank(toIndex)];

    // Piece notation (empty for pawn)
    const pieceNotation = pieceToLetter[pieceType];

    // Capture notation
    let capture = false;
    if(gameState.board[toIndex] != 0){
        capture = true;
    } 
    const captureNotation = capture ? 'x' : '';

    // Combine to create move notation
    const moveNotation = pieceNotation + captureNotation + toFile + toRank;

    return moveNotation;
}
function showModal() {
    document.getElementById("colorSelectionModal").style.display = "block";

}
document.getElementById('selectWhite').addEventListener('click', function(event) {
    event.preventDefault();
    playerColorInput.value = 'white'; // Set the player color
    form.action = `http://localhost:4000/engine_game/${gameState.id}/white`; // Set the form's action
    form.submit(); // Programmatically submit the form
    closeModal();
});

document.getElementById("selectBlack").addEventListener("click", function(event) {
    event.preventDefault();
    playerColorInput.value = 'white'; // Set the player color
    form.action = `http://localhost:4000/engine_game/${gameState.id}/white`; // Set the form's action
    form.submit(); // Programmatically submit the form
    closeModal();
    engineMakeMove();
});

function closeModal() {
    document.getElementById("colorSelectionModal").style.display = "none";
}




let whiteTime = 600; // e.g., 10 minutes in seconds
let blackTime = 600;
let timeIncrement = 0; // e.g., Default 0 second increments
let intervalId;

function updateDisplay() {
    document.getElementById('white-timer').innerText = `White: ${formatTime(whiteTime)}`;
    document.getElementById('black-timer').innerText = `Black: ${formatTime(blackTime)}`;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function startTimer() {
    // Clear existing interval
    clearInterval(intervalId);
    intervalId = setInterval(function() {
        if (gameState.turn == 0) {
            whiteTime--;
        } else {
            blackTime--;
        }
        updateDisplay();
        // Check if time has run out
        if (whiteTime === 0 || blackTime === 0) {
            clearInterval(intervalId); // Stop the timer
            endGame(); // Call a function to handle the end of the game
        }
    }, 1000);
}

//In the future, we should have the player choose what time they want increments by but for now it is default 3
function setIncrementTime() {
    if (gameState.timeIncrementOn === true) {
        timeIncrement = 3; //Change this depending on the player
    }
}

function endGame() {
    if (whiteTime === 0) {
        alert("Time Out for White. Black Wins!");
        gameState.result = 0;
    }
    else if (blackTime === 0) {
        alert("Time Out for Black. White Wins!");
        gameState.result = 1;
    }
}

function addIncrementTime() {
    if (gameState.turn === 0) {
        blackTime += timeIncrement;
    }
    else {
        whiteTime += timeIncrement;
    }
}

// Initialize the display and start the timer
// updateDisplay();
// setIncrementTime();

function updateCapturedPiecesDisplay(piece) {
    let pieceElement = document.createElement('img');
    pieceElement.className = `captured-piece ${color}`;
    pieceElement.src = svgPaths[piece]; // or use an image representing the piece
    if (isWhite(piece) === true) {
        document.getElementById('white-captured-pieces').appendChild(pieceElement);
    } else {
        document.getElementById('black-captured-pieces').appendChild(pieceElement);
    }
}

var selectedCell = null; // Variable to hold the currently highlighted cell index
var validMoves = []; // Variable to hold the valid moves for the currently selected piece


function highlightValidMoves(index) {
    clearHighlights();

    const message = {
        message_type: "moves_request",
        data: {
            from_index: index,
            game_id: gameState.id,
        }
    };
    selectedCell = index;
    // Send the message as a JSON string through the WebSocket
    ws.send(JSON.stringify(message));
}

function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(cell => {
      cell.classList.remove('highlight');

    });
    document.querySelectorAll('.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
  }
function clearOriginHighlights() {
    document.querySelectorAll('.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    document.querySelectorAll('.origin-highlight').forEach(cell => {
        cell.classList.remove('origin-highlight');
    });
    document.querySelectorAll('.to-highlight').forEach(cell => {
        cell.classList.remove('to-highlight');
    });
}
function clearFromHighlights() {
    document.querySelectorAll('.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
}
function handleCellClick(event) {
    clearHighlights();
    cell = event.currentTarget;
    const index = parseInt(cell.id.split('-')[1]);
    console.log("Square Number: ", index);
    const piece = gameState.board[index];
    console.log("Piece:", pieceMapping[piece]);

    //If its whites turn and a black piece is clicked, check if its a valid move for capture
    if(gameState.turn === true && playing_white === true){
        if (piece !== 0 && (pieceColor(piece) === pieceBitRep.black)){
            //Need to check if this is a capture before saying its invalid
            if (validMoves.includes(index)) {
                movePiece(selectedCell, index);
                validMoves = [];
                clearHighlights();
                // clearOriginHighlights();
                selectedCell = null;
                return;
            }else{
                console.log("Piece:", piece);
                console.log("black piece on white turn");
                return;
            }
        }
        if (piece !== 0) {
            highlightValidMoves(index);
        // A piece was clicked; proceed to the next step
        }else if (selectedCell !== null) {
            // An empty cell was clicked; move the piece if this is a valid move
            // Check if this is a valid move for the piece at highlightedIndex
            if (validMoves.includes(index)) {
                movePiece(selectedCell, index);
                validMoves = [];
                clearHighlights();
                // clearOriginHighlights();
                selectedCell = null;
                return;
            }
        }
    }else if(gameState.turn === false && playing_white === false){
        if (piece !== 0 && (pieceColor(piece) === pieceBitRep.white)){
            if (validMoves.includes(index)) {
                movePiece(selectedCell, index);
                validMoves = [];
                clearHighlights();
                // clearOriginHighlights();
                selectedCell = null;
                return;
            }else{
                // console.log("Piece:", piece);
                // console.log("black piece on white turn");
                return;
            }
        }
        if (piece !== 0) {
            highlightValidMoves(index);
        // A piece was clicked; proceed to the next step
        }else if (selectedCell !== null) {
            // An empty cell was clicked; move the piece if this is a valid move
            // Check if this is a valid move for the piece at highlightedIndex
            if (validMoves.includes(index)) {
                movePiece(selectedCell, index);
                validMoves = [];
                clearHighlights();
                // clearOriginHighlights();
                selectedCell = null;
                return;
            }
        }
    }
}

function updateCapturedPiecesDisplay(piece) {
    let pieceElement = document.createElement('img');
    pieceElement.className = `captured-piece ${color}`;
    pieceElement.src = svgPaths[piece]; // or use an image representing the piece
    if (isWhite(piece)) {
        document.getElementById('white-captured-pieces').appendChild(pieceElement);
    } else {
        document.getElementById('black-captured-pieces').appendChild(pieceElement);
    }
}
function engine_move() {
    // Make a move for the engine
    const url = `http://localhost:4000/game/${gameState.id}/engine_move`;
    document.getElementById('engineThinkingOverlay').style.display = 'block';
    document.getElementById('spinner').style.display = 'block';
    fetch(url, {
        method: 'POST',
        // Include any needed headers, like for CSRF tokens or authentication
    })
    .then(response => response.json())
    .then(data => {
        gameState.board = data.board;
        updateDom();
        if (gameState.turn == 0) {
            gameState.turn = 1;
        } else {
            gameState.turn = 0;
        }
        document.getElementById('engineThinkingOverlay').style.display = 'none';
        document.getElementById('spinner').style.display = 'none';
    })
    .catch(error => {
        console.error('Error fetching engine board:', error);
    });
    
    return;
}
function movePiece(fromIndex, toIndex){
    clearOriginHighlights();
    moveMessage = {
        message_type: "GameMove",
        data: {
            game_id: gameState.id,
            fromIndex: fromIndex,
            toIndex: toIndex,
        }
    }
    ws.send(JSON.stringify(moveMessage));
    return;
}
function requestEngineMove(){
    let moveRequest = {
        message_type: "EngineMoveRequest",
        data: {
            game_id: gameState.id,
        }
    }
    console.log("Requesting engine move")
    ws.send(JSON.stringify(moveRequest));
}
/*
Please familiarize yourself with how FEN works before reading this function
https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
*/
// function loadFEN(fen) {
//     //Start at the top left corner of the board
//     // console.log("I made it here");
//     var row = 7;
//     var column = 0;
//     //Squares is different from the 2d board that we may use later
//     //Squares is a 1d array that represents the board in a linear fashion
    
//     //Starting fen: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
//     //Clear board: 8/8/8/8/8/8/8/8 w - - 0 1
//     //For populating the board, the only thing we care about is the first part of the FEN string
//     // gameState[9] = new ulongInt(gameState, 0);
//     // gameState[10] = new ulongInt(gameState, 0);
//     // gameState[11] = new ulongInt(gameState, 0);
//     // gameState[12] = new ulongInt(gameState, 0);
//     // gameState[13] = new ulongInt(gameState, 0);
//     // gameState[14] = new ulongInt(gameState, 0);
//     // gameState[17] = new ulongInt(gameState, 0);
//     // gameState[18] = new ulongInt(gameState, 0);
//     // gameState[19] = new ulongInt(gameState, 0);
//     // gameState[20] = new ulongInt(gameState, 0);
//     // gameState[21] = new ulongInt(gameState, 0);
//     // gameState[22] = new ulongInt(gameState, 0);

//     var components = fen.split(" ");
//     var boardfen = components[0];
//     var turn = components[1];
//     var castling = components[2];
//     var enpassant = components[3];
//     var halfmove = components[4];
//     var fullmove = components[5];
//     var slashCount = 0;
//     //TODO: This section needs error handling
//     // console.log(boardfen);
//     // console.log(boardfen.length);
//     for (let i = 0; i < boardfen.length; i++) {
//         // console.log(i);
//         let position = row * 16 + column;
//         if(column > 8){
//             alert("Invalid FEN, slash omitted when expected")
//             return null;
//         }
//         let c = boardfen[i]; //apparently using let here is preferred?
//         // console.log(c);
//         //In FEN a / indicates we move down a row, thus we decrement rank and set the file back to 0
//         if (c === '/') {
//             slashCount++;
//             row--;
//             column = 0;
//         }else{ //why tf is this the way you check if a char is a number in js?
//             if(position < 0 || position > 119){
//                 break;
//             }
//             if (c >= '0' && c <= '9'){
//                 //
//                 for(let j = 0; j < parseInt(c); j++){
//                     // console.log("Position: ", position)
//                     gameState.board[position] = 0;
//                     // console.log("Piece: ", pieceMapping[gameState.board[position]])
//                     const cell = document.getElementById(`cell-${position}`);
//                     while (cell.firstChild) {
//                         cell.removeChild(cell.firstChild);
//                     }
//                     position++;
//                     column++;
//                 }
//             } else{
//                 if(c === 'k'){
//                     gameState.blackKingPos = position;
//                 }else if(c === 'K'){
//                     gameState.whiteKingPos = position;
//                 }
                
//                 let piece = fenMapping[c];
//                 gameState.board[position] = fenMapping[c];

//                 // Update the DOM
//                 const cell = document.getElementById(`cell-${position}`);
                
//                 // If there's a piece on the cell, remove it.
//                 while (cell.firstChild) {
//                     cell.removeChild(cell.firstChild);
//                 }

//                 // Create a new child element for the piece and append it to the cell.
//                 let img = document.createElement('img');
//                 img.src = svgPaths[piece];
//                 cell.appendChild(img);
//                 position++;
//                 column++;
//             }
//         }
//     }
//     // console.log(slashCount);
//     if(slashCount != 7){
//         alert("Invalid FEN, slash count wrong")
//         return null;
//     }
//     // console.log(turn);
//     if(!(turn === 'w' || turn === 'b')){
//         alert("Invalid turn")
//         return null;
//     }
//     let turnNum = turn === 'w' ? 0 : 1;
//     gameState.turn = turnNum;
//     gameState.castlingWhite["king"] = false;
//     gameState.castlingWhite["queen"] = false;
//     gameState.castlingBlack["king"] = false;
//     gameState.castlingBlack["queen"] = false;

//     for(let i = 0; i<castling.length; i++){
//         let c = castling.charAt(i);
//         if(c === 'K'){
//             gameState.castlingWhite["king"] = true;
//         }else if(c === 'Q'){
//             gameState.castlingWhite["queen"] = true;
//         }else if(c === 'k'){
//             gameState.castlingBlack["king"] = true;
//         }else if(c === 'q'){
//             gameState.castlingBlack["queen"] = true;
//         }
//     }
//     if(enpassant === '-'){
//         gameState.enpassant = null;
//     }else{
//         var col = notationMapping[enpassant.charAt(0)];
//         var row = notationMapping[parseInt(enpassant.charAt(1))];
//         gameState.enpassant = row * 16 + col;
//     }
//     gameState.halfMoveClock = parseInt(halfmove);
//     gameState.fullMoveNumber = parseInt(fullmove);
//     runAttackTable(gameState);
//     if(isSquareUnderAttack(gameState, gameState.whiteKingPos, pieceBitRep.black) == true){
//         gameState.check = true;
//     }else if(isSquareUnderAttack(gameState, gameState.blackKingPos, pieceBitRep.white) == true){
//         gameState.check = true;
//     }
//     pinSearch(gameState, gameState.whiteKingPos);
//     pinSearch(gameState, gameState.blackKingPos);
//     console.log(gameState.board);
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
  


// async function loseChessGame() {
//     loseSound();
//     //await sleep(3500);
//     // First AJAX request to get_token.php to fetch the username
//     var xhrToken = new XMLHttpRequest();
//     xhrToken.open('GET', 'get_token.php', true);

//     xhrToken.onload = function () {
//         if (xhrToken.status >= 200 && xhrToken.status < 300) {
//             var response = JSON.parse(xhrToken.responseText);
//             if (response.status === 'valid') {
//                 var username = encodeURIComponent(response.username);

//                 // Second AJAX request to lose.php to update stats
//                 var xhrLose = new XMLHttpRequest();
//                 xhrLose.open('GET', 'lose.php', true);

//                 xhrLose.onload = function () {
//                     if (xhrLose.status >= 200 && xhrLose.status < 300) {
//                         console.log('lose.php executed successfully');
//                     } else {
//                         console.log('Request to lose.php failed with status: ' + xhrLose.status);
//                     }
//                     // Redirect to the user dashboard with username in URL, regardless of lose.php success
//                     //window.location.href = '../userDashboard?username=' + username;
//                 };

//                 xhrLose.onerror = function () {
//                     console.log('There was an error with the request to lose.php');
//                     // Redirect to the user dashboard with username in URL, even on error
//                     //window.location.href = '../userDashboard?username=' + username;
//                 };

//                 xhrLose.send();
//             } else {
//                 console.log('Invalid token or no user found.');
//                 //window.location.href = '../userDashboard';
//             }
//         } else {
//             console.log('Request to get_token.php failed with status: ' + xhrToken.status);
//             //window.location.href = '../userDashboard';
//         }
//     };

//     xhrToken.onerror = function () {
//         console.log('There was an error with the request to get_token.php');
//         //window.location.href = '../userDashboard';
//     };

//     xhrToken.send();
//   }

//   async function winChessGame() {
//     // Perform an AJAX request to win.php
//     winSound();
//     //await sleep(4000);
//     var xhrToken = new XMLHttpRequest();
//     xhrToken.open('GET', 'get_token.php', true);

//     xhrToken.onload = function () {
//         if (xhrToken.status >= 200 && xhrToken.status < 300) {
//             var response = JSON.parse(xhrToken.responseText);
//             if (response.status === 'valid') {
//                 var username = encodeURIComponent(response.username);

//                 // Second AJAX request to win.php to update stats
//                 var xhrLose = new XMLHttpRequest();
//                 xhrLose.open('GET', 'win.php', true);

//                 xhrLose.onload = function () {
//                     if (xhrLose.status >= 200 && xhrLose.status < 300) {
//                         console.log('win.php executed successfully');
//                     } else {
//                         console.log('Request to win.php failed with status: ' + xhrLose.status);
//                     }
//                     // Redirect to the user dashboard with username in URL, regardless of win.php success
//                     //window.location.href = '../userDashboard?username=' + username;
//                 };

//                 xhrLose.onerror = function () {
//                     console.log('There was an error with the request to win.php');
//                     // Redirect to the user dashboard with username in URL, even on error
//                     //window.location.href = '../userDashboard?username=' + username;
//                 };

//                 xhrLose.send();
//             } else {
//                 console.log('Invalid token or no user found.');
//                 //window.location.href = '../userDashboard';
//             }
//         } else {
//             console.log('Request to get_token.php failed with status: ' + xhrToken.status);
//             //window.location.href = '../userDashboard';
//         }
//     };

//     xhrToken.onerror = function () {
//         console.log('There was an error with the request to get_token.php');
//         //window.location.href = '../userDashboard';
//     };

//     xhrToken.send();
//   }
const pieceMapping = {
    0 : "Empty",
    9 :" White king",
    10 : "White pawn",
    11 : "White knight",
    12 : "White bishop",
    13 : "White rook",
    14 : "White queen",
    17 : "Black king",
    18 : "Black pawn",
    19 : "Black knight",
    20 : "Black bishop",
    21 : "Black rook",
    22 : "Black queen",

}

const pieceToLetter = {
    1 : "K",
    2 : "",
    3 : "N",
    4 : "B",
    5 : "R",
    6 : "Q",
}
const letterToPiece = {
    "K" : 1,
    "N" : 3,
    "B" : 4,
    "R" : 5,
    "Q" : 6,
}

const fenMapping = {
    "r" : pieceBitRep.black | pieceBitRep.rook,
    "n" : pieceBitRep.black | pieceBitRep.knight,
    "b" : pieceBitRep.black | pieceBitRep.bishop,
    "q" : pieceBitRep.black | pieceBitRep.queen,
    "k" : pieceBitRep.black | pieceBitRep.king,
    "p" : pieceBitRep.black | pieceBitRep.pawn,
    "R" : pieceBitRep.white | pieceBitRep.rook,
    "N" : pieceBitRep.white | pieceBitRep.knight,
    "B" : pieceBitRep.white | pieceBitRep.bishop,
    "Q" : pieceBitRep.white | pieceBitRep.queen,
    "K" : pieceBitRep.white | pieceBitRep.king,
    "P" : pieceBitRep.white | pieceBitRep.pawn, 
}

function isWhite(piece) {
    return (piece & pieceBitRep.white) === pieceBitRep.white;
}

function isBlack(piece) {
    return (piece & pieceBitRep.black) === pieceBitRep.black;
}

function pieceColor(piece) {
    if (isWhite(piece)==true) return pieceBitRep.white;
    if (isBlack(piece)==true) return pieceBitRep.black;
    return null;  // This is for cases where the piece might be "none".
}
function isRookOrQueen(piece){
    if(piece === (pieceBitRep.rook | pieceBitRep.black) || piece === (pieceBitRep.rook | pieceBitRep.white) || piece === (pieceBitRep.queen | pieceBitRep.black) || piece === (pieceBitRep.queen | pieceBitRep.white)){
        return true;
    }
    return false;
}
function isBishopOrQueen(piece){
    if(piece === (pieceBitRep.bishop | pieceBitRep.black) || piece === (pieceBitRep.bishop | pieceBitRep.white) || piece === (pieceBitRep.queen | pieceBitRep.black) || piece === (pieceBitRep.queen | pieceBitRep.white)){
        return true;
    }
    return false;
}
function isSlider(piece){
    if(isRookOrQueen(piece) || isBishopOrQueen(piece)){
        return true;
    }
    return false;
}

function copyGameState(gameState) {
    return JSON.parse(JSON.stringify(gameState));
}
function updateDom(){
    for (let i = 0; i < 64; i++) {
        const cell = document.getElementById(`cell-${i}`);
        const piece = gameState.board[i];

        // Clear the current cell
        while (cell.firstChild) {
            cell.removeChild(cell.firstChild);
        }

        // If there is a piece in the current game state cell, create an element for it
        if (piece !== 0) {
            const img = document.createElement('img');
            img.src = svgPaths[piece];
            cell.appendChild(img)
        }
    }
}
function pieceType(piece){
    return piece & 0b111;
}

function flipBoard() {
    const chessBoard = document.getElementById("chessBoard");
    let cells = Array.from(chessBoard.children);
    cells.reverse();

    // Clear the current board
    while (chessBoard.firstChild) {
        chessBoard.removeChild(chessBoard.firstChild);
    }

    // Append the cells in reversed order
    cells.forEach(cell => {
        chessBoard.appendChild(cell);
    });
}

//This does the modal:
function showWinModal() {
    var win = document.getElementById("win-modal-container");
    win.style.display = 'block';
    win.innerHTML = '<div class="modal-content" id="modal-content"><h2>CHECKMATE!</h2><p>You win! Congratulations!</p><button onclick="closeWindow()">Back to Dashboard</button></div>'
    var c = document.getElementById("modal-content");
    c.style.display ='block';
}
function showLossModal() {
    var lose = document.getElementById("lose-modal-container");
    lose.style.display = 'block';
    lose.innerHTML = '<div class="modal-content" id="modal-content"><h2>CHECKMATED!</h2><p>You lose! Better luck next time!</p><button onclick="closeWindow()">Back to Dashboard</button></div>'
    var c = document.getElementById("modal-content");
    c.style.display ='block';
}
function showDrawModal() {
    var draw = document.getElementById("draw-modal-container");
    draw.style.display = 'block';
    draw.innerHTML = '<div class="modal-content" id="modal-content"><h2>STALEMATE!</h2><p>Draw game! No winners here!</p><button onclick="closeWindow()">Back to Dashboard</button></div>'
    var c = document.getElementById("modal-content");
    c.style.display ='block';
}

function closeWindow() {
    window.history.back();
}
  