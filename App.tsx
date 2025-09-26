
import React, { useEffect } from 'react';
import { useGame } from './hooks/useGame';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import { useAudio } from './context/AudioContext';
import bgMusic from './assets/sfx/bg-music.mp3';

const App: React.FC = () => {
  const { state } = useGame();
  const { isBackgroundPlaying, playBackground, preload } = useAudio();

  useEffect(() => { preload(bgMusic); }, [preload]);

  // If user refreshes mid-game (state.gameStarted true) start background music.
  useEffect(() => {
    if (state.gameStarted && !isBackgroundPlaying) {
      playBackground(bgMusic, {
        loopRegion: { start: 14.2, end: 54 },
        volume: 0.45,
        fadeIn: 1.5,
      }).catch(err => console.warn('Failed to init bg music in App:', err));
    }
  }, [state.gameStarted, isBackgroundPlaying, playBackground]);

  return (
    <div className="min-h-screen bg-black">
      {state.gameStarted ? <GameScreen /> : <StartScreen />}
    </div>
  );
};

export default App;
