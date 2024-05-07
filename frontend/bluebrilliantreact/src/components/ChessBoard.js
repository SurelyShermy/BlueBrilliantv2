import React, { useState, useEffect, useRef} from 'react';
import ChessSquare from './ChessSquare';
import EngineInteractive from './engineInteractive';
import PromotionModal from './promoteModal';
import ResignButton from './ResignButton';
import ChatButton from './Chatbutton';
import SearchButton from './SearchButton';
import '../App.css';
import GameOverModal from './GameOverModal';

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
const ChessBoard = ({ ws, username, gameId, newGame = null}) => {
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [isPieceSelected, setIsPieceSelected] = useState(false);
    const [currentPlayerColor, setCurrentPlayerColor] = useState(null); 
    const [outputArray, setOutputArray] = useState([]);
    const [gameResult, setGameResult] = useState('');
    const [gameState, setGameState] = useState({
        board: null,
        id: null,
        player1_id: null,
        player2_id: null,
        player1_color: null,
        player2_color: null,
        turn: null,
        board_array: [
          13,11,12,14,9,12,11,13,
          10,10,10,10,10,10,10,10,
          0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,
          18,18,18,18,18,18,18,18,
          21,19,20,22,17,20,19,21],
        engine: false,
        player1_time: 0,
        player2_time: 0,
        });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [rematchRequested, setRematchRequested] = useState(false);
    const outgoingRematch = () => {
      const rematchRequest = {
        message_type: "rematch_request",
        data: {
          message_type: "rematch_request",
        }
      };
      ws.send(JSON.stringify(rematchRequest));
    };
    const rematchConfirmed = () => {
      const rematchRequest = {
        message_type: "rematch_confirmed",
        data: {
          game_id: gameState.id,
        }
      };
      ws.send(JSON.stringify(rematchRequest));
      setRematchRequested(false);
      setModalIsOpen(false);
    };
    const closeModal = () => {
        setModalIsOpen(false);
        ws.close();
        window.location.reload();
    };
    const [dragging, setDragging] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);
    const [isPromotionOpen, setIsPromotionOpen] = useState(false);
    const [promotionData, setPromotionData] = useState(null);
    const whitePromotionOptions = [
      {type: "knight", image: "/chessPieces/white/N.svg"},
      {type: "bishop", image: "/chessPieces/white/B.svg"},
      {type: "rook", image: "/chessPieces/white/R.svg"},
      {type: "queen", image: "/chessPieces/white/Q.svg"},
    ];
    const blackPromotionOptions = [
      {type: "knight", image: "/chessPieces/black/n.svg"},
      {type: "bishop", image: "/chessPieces/black/b.svg"},
      {type: "rook", image: "/chessPieces/black/r.svg"},
      {type: "queen", image: "/chessPieces/black/q.svg"},
    ];
    const handlePieceSelection = (type) => {
      // Assuming you handle promotion and encode it here
      console.log(`Promoted to: ${type}`);
      setIsPromotionOpen(false);
      const difference = promotionData.toPosition - promotionData.fromPosition;
      let direction;
      let piece;
      if (gameState.turn){
        if (difference === 8){
          direction = 1 << 7;
        }else if (difference === 7){
          direction = 0;
        }else{
          direction = 1<<6;
        }
      }else{
        if (difference === -8){
          direction = 1 << 7;
        }else if (difference === -7){
          direction = 0;
        }else{
          direction = 1 << 6;
        }
      }
      switch (type) {
        case "knight":
          piece = 0;
          break;
        case "bishop":
          piece = (1 << 4);
          break;
        case "rook":
          piece = (1 << 5);
          break;
        case "queen":
          piece = (1<<4) | (1<<5);
          break;
        default:
          piece = (1<<4) | (1<<5);
          break;
      }
      let encodedToPosition = piece | direction;
      console.log("sent", promotionData.fromPosition, encodedToPosition)
      const moveMessage = {
          message_type: "GameMove",
          data: {
              game_id: gameState.id,
              fromIndex: promotionData.fromPosition,
              toIndex: encodedToPosition,
          }
      };
      ws.send(JSON.stringify(moveMessage));
      setPromotionData(null);
  };
    const pieceColor = (piece) => {
        if ((piece & pieceBitRep.white) === pieceBitRep.white) {
          return pieceBitRep.white;
        } else if ((piece & pieceBitRep.black) === pieceBitRep.black) {
          return pieceBitRep.black;
        } else {
          return null;
        }
    }
    const resign = () => {
      if(ws){
        const resignMessage = {
          message_type: "resign_request",
          data: {
            game_id: gameState.id,
            player: username,
          }
        };
        ws.send(JSON.stringify(resignMessage));
      }
    };
    //FOR CLICKING ONLY
    const onSelectSquare = (position) => {
        const piece = gameState.board_array[position];
        console.log("selected square");
        console.log(piece);
        console.log(currentPlayerColor);
        let playercolor = currentPlayerColor ? pieceBitRep.white : pieceBitRep.black;
        if (ws){
          if (isPieceSelected === true) {
            if ((piece !== 0 && (pieceColor(piece) === playercolor)) || legalMoves.includes(position)) {
              console.log("making move")
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
          } else if (piece !== 0 && (pieceColor(piece) === playercolor)) {
            setSelectedSquare(position);
            setIsPieceSelected(true);
            console.log("requesting moves")

              const movesRequest = {
                  message_type: "moves_request",
                  data: {
                      fromIndex: position,
                      game_id: gameState.id,
                  }
              };
            ws.send(JSON.stringify(movesRequest));
          }
        }
    };
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 }); // Position of the piece being dragged

    const onDragStart = (e, position) => {
        document.body.style.cursor = 'grabbing';
        setDragging(position);
        setDragPosition({ x: e.clientX, y: e.clientY });
        if (ws) {
            let color = currentPlayerColor ? pieceBitRep.white : pieceBitRep.black;
            if (pieceColor(gameState.board_array[position]) !== color) {
                return;
            }
            const message = {
                message_type: "moves_request",
                data: {
                    fromIndex: position,
                    game_id: gameState.id,
                }
            };
            ws.send(JSON.stringify(message));
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        if (dragging !== null) {
            setDragPosition({ x: e.clientX, y: e.clientY }); // Update position as mouse moves
        }
    };

    const onDrop = (e, toPosition) => {
      document.body.style.cursor = 'default';
        if (ws) {
            document.body.style.cursor = '';
            e.preventDefault();
            if (legalMoves.includes(toPosition)) {
                const fromPosition = dragging;
                if (gameState.board_array[fromPosition] === (pieceBitRep.pawn | pieceBitRep.white)) {
                    if (toPosition >= 56) {
                      //This is a promotion, pop a modal
                      setIsPromotionOpen(true);
                      setPromotionData({ fromPosition, toPosition });
                      return;
                    }
                  }else if(gameState.board_array[fromPosition] === (pieceBitRep.pawn | pieceBitRep.black)){
                    if (toPosition <= 7) {
                      //This is a promotion, pop a modal
                      setIsPromotionOpen(true);
                      setPromotionData({ fromPosition, toPosition });
                      return;
                    }
                  }
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
            setDragPosition({ x: 0, y: 0 }); // Reset position
        } else {
            setDragging(null);
            setDragPosition({ x: 0, y: 0 });
            return;
        }
    };

    const sendTimeUpdateRequest = () => {
        if (modalIsOpen === false){
          const timeUpdateRequest = {
            message_type: "time_update",
            data: { gameId: gameId },
          };
          if ((currentPlayerColor === gameState.turn) && !gameState.engine){
              ws.send(JSON.stringify(timeUpdateRequest));
          }
        }else{
          return;
        }
    };
    function formatTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`; // Pads the seconds with zero if less than 10
    }
    const timeUpdateRequestRef = useRef(sendTimeUpdateRequest);
    
    useEffect(() => {
      if (modalIsOpen === false || !gameState.engine){
        timeUpdateRequestRef.current = sendTimeUpdateRequest;
      }
    });
    useEffect(() => {

        if (ws) {
          const initialize = {
            message_type: "Initialize",
            data: {
              game_id: gameId,
            }
          };
          ws.send(JSON.stringify(initialize));
          const timeUpdateInterval = setInterval(() => {
            timeUpdateRequestRef.current();
          }, 1000);
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
                engine: message.engine,
                player1_time: message.player1_time,
                player2_time: message.player2_time,
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
            else if(message.message_type === "time_update") {
              setGameState({
                ...gameState,
                player1_time: message.player1_time,
                player2_time: message.player2_time,
              });
            }
            else if(message.message_type === "gameOver_response") {
              if (message.result.endsWith("wins")) {
                let winner = message.result.split(" ")[0];
                if (winner === username) {
                  console.log("winner", winner, username)
                  setGameResult("win");
                }else{
                  console.log("loser", winner, username)
                  setGameResult("loss");
                }
                setModalIsOpen(true);
              }else if (message.result === "Stalemate") {
                setGameResult("draw");
                setModalIsOpen(true);
              }else if(message.result.endsWith("resigned")){
                let winner = message.result.split(" ")[0];
                let loser = message.result.split(" ")[1];
                if (winner === username) {
                  setGameResult("win resign");
                }else{
                  setGameResult("loss resign");
                }
                setModalIsOpen(true);
              }else if(message.result.endsWith("wins on time")){
                let winner = message.result.split(" ")[0];
                if (winner === username) {
                  setGameResult("win time");
                }else{
                  setGameResult("loss time");
                }
                setModalIsOpen(true);
              }
            }
            else if (message.message_type === "rematchRequest") {
              setRematchRequested(true);
            }
          };
          
          ws.onclose = () => {
            console.log("Disconnected from the game WebSocket");
            clearInterval(timeUpdateInterval); // Clear interval on socket close

          };
          ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            clearInterval(timeUpdateInterval); // Clear interval on socket close
          };
      
          return () => {
            clearInterval(timeUpdateInterval); // Clear interval on socket close
            ws.close();
          };
        }
        else{
          const outputArray = calculateOutputArray(
            gameState.board_array,
            false
          );
          setOutputArray(outputArray);
        }
      }, [ws, gameId, username]);
      const calculateOutputArray = (boardArray, playerColor) => {
        if (ws){
          if (playerColor === true) {
            const array = new Array(64).fill(0);
            for (let i = 0; i < boardArray.length; i++) {
            array[i] = boardArray[i ^ 56];
            }
            return array;
          } else {
            const array = new Array(64).fill(0);
            for (let i = 0; i < boardArray.length; i++) {
            array[i] = boardArray[i ^ 7];
            }
            return array;
          }
        }else{
          const array = new Array(64).fill(0);
            for (let i = 0; i < boardArray.length; i++) {
              array[i] = boardArray[i ^ 56];
            }
            return array;
        }
  
      };
  if (!gameState.id && !ws) {
    return (
    <div className = "BoardWrapper">
      <div className="ChessBoard">
        {outputArray.map((piece, index) => (
          <ChessSquare
            key={index}
            piece={piece}
            dragPosition={dragPosition}
            position={index}
            legalMoves={legalMoves}
            onSelectSquare={() => onSelectSquare(index)}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            isSelected={selectedSquare === index}
            isDragging={dragging === index}
          />
        ))}

    </div>
    <EngineInteractive engine = {gameState.engine}/>
    <ResignButton defaultImg="/images/base_resign.png" hoverImg="/images/hover_resign.png" onClick={null} altText="Resign"/>
    <ChatButton defaultImg="/images/chatbutton.png" hoverImg="/images/chatbutton.png" onClick={null} altText="Resign"/>
    <SearchButton defaultImg="/images/searchbutton.png" hoverImg="/images/searchbutton.png" onClick={null} altText="Resign"/>
    {/* <GameOverModal isOpen={true} result={"win"} rematchRequest={outgoingRematch} newGame = {newGame} onClose={closeModal} rematchRequested={rematchRequested}/> */}
      <div className = 'timer2'>
          10:00
        </div>
      <div className = 'timer1'>  
          10:00
      </div>
      <div className='player1_Stats'>
        <img src="images/defaultprofilepic.png" alt =""></img>

        <span>{username ? username : "Player 1"}</span>
      </div>
      <div className='player2_Stats'>
        <img src="images/defaultprofilepic.png" alt =""></img>

        <span>{gameState.player2_id ? gameState.player2_id : "Player 2"}</span>
      </div>

 </div>);
  }
  return (
    <div className = "BoardWrapper">
      <div className="ChessBoard">
        {outputArray.map((piece, index) => (
          <ChessSquare
            key={index}
            piece={piece}
            position={currentPlayerColor === true ? index^56: index^7}
            legalMoves={legalMoves}
            dragPosition={dragPosition}
            onSelectSquare={() => onSelectSquare(index)}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            isSelected={selectedSquare === index}
            isDragging={dragging === index}
          />
        ))}
        <PromotionModal
          isOpen={isPromotionOpen}
          options={currentPlayerColor ? whitePromotionOptions : blackPromotionOptions}
          onSelect={handlePieceSelection}
        />
        </div>
        <EngineInteractive engine = {gameState.engine}/>
        <ResignButton defaultImg="/images/base_resign.png" hoverImg="/images/hover_resign.png" onClick={resign} altText="Resign"/>
        <ChatButton defaultImg="/images/chatbutton.png" hoverImg="/images/chatbutton.png" onClick={null} altText="Resign"/>
        <SearchButton defaultImg="/images/searchbutton.png" hoverImg="/images/searchbutton.png" onClick={null} altText="Resign"/>
        <GameOverModal isOpen={modalIsOpen} result={gameResult} rematchRequest={outgoingRematch} newGame = {newGame} onClose={closeModal} rematchRequested={rematchRequested} rematchConfirm={rematchConfirmed}/>
        <div className = 'timer2'>
          {username === gameState.player1_id ? formatTime(gameState.player2_time) : formatTime(gameState.player1_time)}
        </div>
        <div className = 'timer1'>
          {username === gameState.player1_id ? formatTime(gameState.player1_time) : formatTime(gameState.player2_time)}
        </div>
        <div className='player1_Stats'>
            <img src="defaultprofilepic.png" alt =""></img>
            <span>{username}</span>
        </div>
        <div className='player2_Stats'>
          <img src="defaultprofilepic.png" alt =""></img>
          <span>{username == gameState.player1_id ? gameState.player2_id : gameState.player1_id}</span>

        </div>
        <button onClick={resign} className="resign">Resign</button>
      
    </div>
  );
};
export default ChessBoard;