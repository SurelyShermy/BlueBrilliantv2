import React from 'react';

function PromotionModal({ onSelect, options, isOpen }) {
    if (!isOpen) return null;

    return (
        <div className="promotion_modal">
            <div className="modal-content">
                <h4>Select piece for promotion:</h4>
                <div className="promotion-options">
                    {options.map(option => (
                        <img
                            key={option.type}
                            src={option.image}
                            alt={option.type}
                            onClick={() => onSelect(option.type)}
                            style={{ cursor: 'pointer', width: '50px', height: '50px' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PromotionModal;