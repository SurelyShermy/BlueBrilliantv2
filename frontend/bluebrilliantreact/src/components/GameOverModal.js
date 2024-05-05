import React from 'react';
import ReactDOM from 'react-dom';

const GameOverModal = ({ isOpen, result, rematch, newGame, onClose }) => {
    if (!isOpen) return null;

    // Decide content based on the result
    let title, description, imageUrl;
    switch (result) {
        case 'win':
            title = 'Nice!';
            description = 'checkmate!';
            imageUrl = '/images/winimage.png';
            break;
        case 'loss':
            title = 'Game Over!';
            description = 'Better luck next time!';
            imageUrl = '/images/lossimage.png';
            break;
        case 'draw':
            title = 'It\'s a Draw!';
            description = 'How evenly matched!';
            imageUrl = '/images/draw.png';
            break;
    }

    return ReactDOM.createPortal(
        <div className="gameOverModal">
              {/* <h1>{title}</h1>
              <p>{description}</p> */}
            <h1>{title}</h1>
              <img src={imageUrl} alt={title} className={imageUrl.split("/images/")[1].split(".png")[0]}/>
              <img src={"/images/modalbackground.png"} className='modalBackground'></img>
              <img src={"/images/closeModal.png"} className='closeModal' onClick={onClose}></img>
            <h2>{description}</h2>
            <img src={"/images/rematchbutton.png"} className='rematch' onClick={rematch}></img>
            <img src={"/images/playagain.png"} className='playagain' onClick={newGame}></img>
              {/* <button onClick={rematch}>Rematch</button>
              <button onClick={newGame}>New Game</button> */}
        </div>,
        document.getElementById('modal-root') // Assuming there's a div with this ID in your index.html
    );
};

export default GameOverModal;