import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';

const StartScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { dispatch } = useGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch({ type: 'START_GAME', payload: { playerName: name.trim() } });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white bg-black overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 animate-pulse-slow" 
        style={{ backgroundImage: "url('https://picsum.photos/seed/horror_game/1920/1080')", filter: 'grayscale(100%) brightness(0.4)' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
      <div className="absolute inset-0" style={{boxShadow: 'inset 0 0 150px 20px black'}}></div>
      
      <div className="relative z-10 text-center p-8 animate-fadeIn">
        <h1 className="text-7xl md:text-9xl font-creepster text-red-700 tracking-widest animate-flicker" style={{ textShadow: '0 0 10px #ff0000, 0 0 20px #ff0000' }}>
          SAN GUBAT
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mt-2 tracking-wider">CHRONICLES</p>

        <form onSubmit={handleSubmit} className="mt-16 flex flex-col items-center">
          <label htmlFor="playerName" className="text-lg text-gray-400 mb-4">
            Enter your name, hunter.
          </label>
          <input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-b-2 border-red-700 text-center text-2xl text-white focus:outline-none focus:border-red-500 transition duration-300 w-64 md:w-80 p-2"
            maxLength={20}
            required
          />
          <button
            type="submit"
            className="mt-8 px-10 py-3 font-bold text-lg text-white bg-red-800/80 border border-red-600 rounded-sm hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            ENTER THE DARKNESS
          </button>
        </form>
      </div>
       <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 2s ease-out forwards;
          }
          @keyframes pulse-slow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 10s ease-in-out infinite;
          }
          @keyframes flicker {
            0%, 19.9%, 22%, 62.9%, 64%, 64.9%, 70%, 100% {
              opacity: 1;
              text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
            }
            20%, 21.9%, 63%, 63.9%, 65%, 69.9% {
              opacity: 0.8;
              text-shadow: none;
            }
          }
          .animate-flicker {
            animation: flicker 4s infinite;
          }
        `}</style>
    </div>
  );
};

export default StartScreen;