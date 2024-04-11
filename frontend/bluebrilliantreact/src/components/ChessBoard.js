import React, { useState } from 'react';
import ChessSquare from './ChessSquare';

const Chessboard = ({ ws }) => {
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
    const [board, setBoard] = useState(initialBoardState); // Initial board setup
    const [dragging, setDragging] = useState(null); // Position of the piece being dragged
    const [legalMoves, setLegalMoves] = useState([]);

    const onDragStart = (e, position) => {
        const message = {
        message_type: "moves_request",
        data: {
            from_index: position,
            game_id: gameState.id, // Ensure gameState is managed and available in this component or passed as props
        }
        };
        ws.send(JSON.stringify(message)); // Assuming 'ws' is your WebSocket instance
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e, position) => {
        e.preventDefault();
        if (legalMoves.includes(position)) {
        // Make the move and update the board state
        }
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
            }
        };
        ws.onclose = () => {
            console.log("Disconnected from the game WebSocket");
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }
  }, [ws]); 
  return (
    <div className="ChessBoard">
      {board.map((piece, index) => (
        <ChessSquare
          key={index}
          piece={piece}
          position={index}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};