import React, { useState } from 'react';

function EngineInteractive({engine = false}) {
    if(!engine){
        return (
            <img src = "/images/engine_off.svg" alt = "Engine off" className='engineInteractive' />
        );
    }else{
        return (
            <section>
                <img src = "/images/engine_on_low.svg" alt = "Engine on" className='engineInteractive top' />
                <img src = "/images/engine_on_high.svg" alt = "Engine on" className='engineInteractive bottom' />
            </section>
        );
    }
}

export default EngineInteractive;