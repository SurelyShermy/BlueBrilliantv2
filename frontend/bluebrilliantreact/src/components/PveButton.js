import React, { useState } from 'react';
import PlayEngineBase from './hoveredEnginebutton';

function PveButton({ defaultImg, hoverImg, onClick, disabled = false, altText }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        if (!disabled) {
            setIsHovered(true);
        }
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };
    if (disabled){
        <img onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} disabled={disabled} className='pveButton' src={isHovered ? hoverImg : defaultImg} alt={altText} style={{ transition: 'transform 0.6s'}} />
    }
    else{
        return (
            <img onClick={onClick} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} disabled={disabled} className='pveButton' src={isHovered ? hoverImg : defaultImg} alt={altText} style={{ transition: 'transform 0.6s'}} />
        );
    }
}

export default PveButton;