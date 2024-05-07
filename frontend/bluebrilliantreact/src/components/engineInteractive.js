import React, { useState } from 'react';

function EngineInteractive({engine = false, thinking = false}) {
    if(!engine){
        return (
            <img src = "/images/engine_off.svg" alt = "Engine off" className='engineInteractive' />
        );
    }else{
        if(thinking){
            return (
                <section>
                    <img src = "/images/thinking.png" alt = "Engine thinking" className='thinking' />
                    <img src = "/images/engine_on_low.svg" alt = "Engine on" className='engineInteractive top' />
                    <img src = "/images/engine_on_high.svg" alt = "Engine on" className='engineInteractive bottom' />
                </section>
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
}

export default EngineInteractive;