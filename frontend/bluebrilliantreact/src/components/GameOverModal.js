import React from 'react';
import ReactDOM from 'react-dom';

const GameOverModal = ({ isOpen, result, rematchRequest, newGame, onClose, rematchRequested, rematchConfirm}) => {
    if (!isOpen) return null;

    // Decide content based on the result
    let title, description, imageUrl;
    switch (result) {
        case 'win':
            title = 'Nice!';
            description = 'Checkmate!';
            imageUrl = '/images/win.png';
            break;
        case 'loss':
            title = 'Game Over!';
            description = 'Checkmate!';
            imageUrl = '/images/lossimage.png';
            break;
        case 'draw':
            title = 'Draw!';
            description = 'Evenly Matched!';
            imageUrl = '/images/draw.png';
            break;
        case 'win time':
            title = 'Time Out!';
            description = 'You win!';
            imageUrl = '/images/win.png';
            break;
        case 'loss time':
            title = 'Time Out!';
            description = 'You lose!';
            imageUrl = '/images/lossimage.png';
            break;
        case 'loss resign':
            title = 'Resignation';
            description = 'You lose!';
            imageUrl = '/images/lossimage.png';
            break;
        case 'win resign':
            title = 'Resignation';
            description = 'You win!';
            imageUrl = '/images/win.png';
            break;
    }
    if (rematchRequested === false){
        return ReactDOM.createPortal(
            <div className="gameOverModal">
                  {/* <h1>{title}</h1>
                  <p>{description}</p> */}
                <h1>{title}</h1>
                  <img src={imageUrl} alt={title} className={imageUrl.split("/images/")[1].split(".png")[0]}/>
                  <img src={"/images/modalbackground.png"} className='modalBackground'></img>
                  <img src={"/images/closeModal.png"} className='closeModal' onClick={onClose}></img>
                <h2>{description}</h2>
                
                {/* <img src={"/images/rematchbutton.png"} className='rematch' onClick={rematchRequest}></img>
                <img src={"/images/playagain.png"} className='playagain' onClick={newGame}></img> */}
                  {/* <button onClick={rematch}>Rematch</button>
                  <button onClick={newGame}>New Game</button> */}
            </div>,
            document.getElementById('modal-root') // Assuming there's a div with this ID in your index.html
        );
    }else if (rematchRequested === true){
        return ReactDOM.createPortal(
            <div className="gameOverModal">
                  {/* <h1>{title}</h1>
                  <p>{description}</p> */}
                <h1>{title}</h1>
                  <img src={imageUrl} alt={title} className={imageUrl.split("/images/")[1].split(".png")[0]}/>
                  <img src={"/images/modalbackground.png"} className='modalBackground'></img>
                  <img src={"/images/closeModal.png"} className='closeModal' onClick={onClose}></img>
                {/* <h2>Rematch?</h2>
                
                <img src={"/images/rematchbutton-y.png"} className='rematchbutton-y' onClick={rematchConfirm}></img>
                <img src={"/images/rematchbutton-n.png"} className='rematchbutton-n' onClick={onClose}></img> */}
                  {/* <button onClick={rematch}>Rematch</button>
                  <button onClick={newGame}>New Game</button> */}
            </div>,
            document.getElementById('modal-root') // Assuming there's a div with this ID in your index.html
        );
    }

};

export default GameOverModal;