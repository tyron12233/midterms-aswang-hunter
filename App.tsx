
import React from 'react';
import { useGame } from './hooks/useGame';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';

const App: React.FC = () => {
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-black">
      {state.gameStarted ? <GameScreen /> : <StartScreen />}
    </div>
  );
};

export default App;
