import React from 'react';
import { useGame } from '../hooks/useGame';
import Hud from './Hud';
import SceneDisplay from './SceneDisplay';
import Jumpscare from './Jumpscare';
import { useLockScroll } from '../hooks/useLockScroll.ts';

const GameScreen: React.FC = () => {
    const { state, dispatch } = useGame();
    useLockScroll();

    return (
        <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
            <Hud />
            <SceneDisplay key={state.currentScene} />
            {state.jumpScare && (
                <Jumpscare
                    imageSrc={state.jumpScare.image}
                    soundSrc={state.jumpScare.sound}
                    onComplete={() => dispatch({ type: 'CLEAR_JUMPSCARE' })}
                />
            )}
        </div>
    );
};

export default GameScreen;