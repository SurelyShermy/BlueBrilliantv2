import React, { useState, useEffect } from 'react';
import ChessSquare from './ChessSquare';
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
const ChessBoard = ({ ws, username, gameId}) => {
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [isPieceSelected, setIsPieceSelected] = useState(false);
    const [currentPlayerColor, setCurrentPlayerColor] = useState(null); 
    const [outputArray, setOutputArray] = useState([]);
    const [gameState, setGameState] = useState({
        board: null,
        id: null,
        player1_id: null,
        player2_id: null,
        player1_color: null,
        player2_color: null,
        turn: null,
        board_array: [],
        engine: false
        });
    const [dragging, setDragging] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);

    const pieceColor = (piece) => {
        if ((piece & pieceBitRep.white) === pieceBitRep.white) {
          return pieceBitRep.white;
        } else if ((piece & pieceBitRep.black) === pieceBitRep.black) {
          return pieceBitRep.black;
        } else {
          return null;
        }
    }
    //FOR CLICKING ONLY
    const onSelectSquare = (position) => {
        const piece = gameState.board_array[position];
        if (isPieceSelected) {
          if ((piece !== 0 && pieceColor(piece) === currentPlayerColor) || legalMoves.includes(position)) {
            const moveMessage = {
              message_type: "make_move",
              data: {
                fromIndex: selectedSquare,
                toIndex: position,
                game_id: gameState.id,
              }
            };
            ws.send(JSON.stringify(moveMessage));
            setIsPieceSelected(false);
            setSelectedSquare(null);
          } else {
            setIsPieceSelected(false);
            setSelectedSquare(null);
          }
        } else if (piece !== 0 && pieceColor(piece) === currentPlayerColor) {
          setSelectedSquare(position);
          setIsPieceSelected(true);
            const movesRequest = {
                message_type: "moves_request",
                data: {
                    fromIndex: position,
                    game_id: gameState.id,
                }
            };
          ws.send(JSON.stringify(movesRequest));
        }
    };

    
    const onDragStart = (e, position) => {
        document.body.style.cursor = 'grabbing';
        setDragging(position);
        const message = {
        message_type: "moves_request",
        data: {
            fromIndex: position,
            game_id: gameState.id,
        }
        };
        ws.send(JSON.stringify(message));
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e, toPosition) => {
        document.body.style.cursor = '';
        e.preventDefault();
        if (legalMoves.includes(toPosition)) {
            const fromPosition = dragging;
            const moveMessage = {
                message_type: "GameMove",
                data: {
                    game_id: gameState.id,
                    fromIndex: fromPosition,
                    toIndex: toPosition,
                }
            };
            ws.send(JSON.stringify(moveMessage));
        }
        setLegalMoves([]);
        setDragging(null);
    };
    useEffect(() => {
        if (ws) {
          const initialize = {
            message_type: "Initialize",
            data: {
              game_id: gameId,
            }
          };
          ws.send(JSON.stringify(initialize));
      
          ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);
            
            if (message.message_type === "valid_moves") {
              setLegalMoves(message.moves);
            }
            
            else if (message.message_type === "GameState") {
              const isPlayer1 = username === message.player1_id;
              const playerColor = isPlayer1 ? message.player1_color : message.player2_color;
              
              // Here we're calculating the output array directly inside the onmessage handler
              const outputArray = calculateOutputArray(
                message.board_array,
                playerColor
              );
              
              setGameState({
                board: message.board,
                board_array: message.board_array,
                turn: message.turn,
                id: message.game_id,
                player1_color: message.player1_color,
                player2_color: message.player2_color,
                player1_id: message.player1_id,
                player2_id: message.player2_id,
                engine: message.engine
              });
              setCurrentPlayerColor(playerColor);
              setOutputArray(outputArray);
              if (message.engine === true && playerColor !== message.turn) {
                const moveMessage = {
                  message_type: "EngineMoveRequest",
                  data: {
                    game_id: message.game_id,
                  }
                };
                ws.send(JSON.stringify(moveMessage));
              }
              const game_over_request = {
                message_type: "gameOver_request",
                data: {
                  game_id: message.game_id,
                }
              }
              ws.send(JSON.stringify(game_over_request));
            }
            else if(message.message_type === "gameOver_Response") {
              if (message.data.result === "Checkmate") {
                alert("Game Over, checkmate");
                ws.close();
              }else if (message.data.result === "Stalemate") {
                alert("Game Over, stalemate");
                ws.close();
              }else if(message.data.result ==="Resignation"){
                alert("Game Over, resignation");
                ws.close();
              }else if (message.data.result === "False") {
                console.log("Game is still going on");
              }
            }
          };
          
          ws.onclose = () => console.log("Disconnected from the game WebSocket");
          ws.onerror = (error) => console.error("WebSocket error:", error);
      
          return () => {
            ws.close();
          };
        }
      }, [ws, gameId, username]);
    const calculateOutputArray = (boardArray, playerColor) => {
        if (playerColor === true) {
            const array = new Array(64).fill(0);
            for (let i = 0; i < boardArray.length; i++) {
            array[i] = boardArray[i ^ 56];
            }
            return array;
        } else {
            return boardArray;
        }
    };
  if (!gameState.board_array || gameState.board_array.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <div className="ChessBoard">
      {outputArray.map((piece, index) => (
        <ChessSquare
          key={index}
          piece={piece}
          position={index^56}
          legalMoves={legalMoves}
          onSelectSquare={onSelectSquare}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          isSelected={selectedSquare === index}
          isDragging={dragging === index}
        />
      ))}
    </div>
  );
};
export default ChessBoard;