
import React, { useEffect, useState } from 'react';
import { useGame } from './hooks/useGame';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import Preloader from './components/Preloader';
import { useAudio } from './context/AudioContext';

const bgMusic = '/assets/sfx/bg-music.mp3';

const App: React.FC = () => {
  const { state } = useGame();
  const { isBackgroundPlaying, playBackground } = useAudio();
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // If user refreshes mid-game (state.gameStarted true) start background music.
  useEffect(() => {
    if (state.gameStarted && !isBackgroundPlaying && assetsLoaded) {
      playBackground(bgMusic, {
        loopRegion: { start: 14.2, end: 54 },
        volume: 0.45,
        fadeIn: 1.5,
      }).catch(err => console.warn('Failed to init bg music in App:', err));
    }
  }, [state.gameStarted, isBackgroundPlaying, playBackground, assetsLoaded]);

  const handlePreloadComplete = () => {
    setAssetsLoaded(true);
  };

  // Show preloader first
  if (!assetsLoaded) {
    return <Preloader onComplete={handlePreloadComplete} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {state.gameStarted ? <GameScreen /> : <StartScreen />}
    </div>
  );
};

export default App;
