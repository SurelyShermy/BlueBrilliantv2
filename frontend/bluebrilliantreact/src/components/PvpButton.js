import React, { useState } from 'react';

function PvpButton({ defaultImg, hoverImg, loggedInImg, onClick, disabled = false, altText, loggedIn }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        if (!disabled) {
            setIsHovered(true);
        }
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };
    if (!loggedIn) {
        return (
            <img src={defaultImg} className = "pvpButton" alt={altText}/>
        );
    }else{
        if (disabled){
            return (
                <img onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} disabled={disabled} className = "pvpButton" src={isHovered ? hoverImg : loggedInImg} alt={altText} style={{ transition: 'transform 0.6s'}} />
            );
        }
        else{
            return (
                <img src={isHovered ? hoverImg : loggedInImg} alt={altText} onClick={onClick} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} disabled={disabled} className = "pvpButton" style={{ transition: 'transform 0.6s' }} />
            );
        }
    }
}

export default PvpButton;