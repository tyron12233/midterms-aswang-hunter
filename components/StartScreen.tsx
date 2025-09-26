import React, { useEffect, useState } from 'react';
import { useLockScroll } from '../hooks/useLockScroll.ts';
import { useGame } from '../hooks/useGame';
import { useAudio } from '../context/AudioContext';

import backgroundImage from '../assets/bg.png';
import bgMusic from '../assets/sfx/bg-music.mp3';

const StartScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { dispatch } = useGame();
  const { playBackground, isBackgroundPlaying, hasUserInteracted } = useAudio();

  // Start background music when component mounts (assets are already preloaded)
  useEffect(() => {
    if (!isBackgroundPlaying) {
      playBackground(bgMusic, {
        loopRegion: { start: 14.2, end: 54 },
        volume: 0.45,
        fadeIn: 2,
      }).catch(err => console.warn('Background music failed to start (maybe waiting interaction):', err));
    }
  }, [isBackgroundPlaying, playBackground]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch({ type: 'START_GAME', payload: { playerName: name.trim() } });
    }
  };

  useLockScroll();

  return (
    <div className="fixed inset-0 text-white bg-black overflow-hidden animate-startscreen-enter">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-pulse-slow"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Dark vignette + right side emphasis gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_40%,#000_95%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/85 via-black/40 to-transparent" />

      {/* Foreground layout */}
      <div className="relative z-10 flex h-screen">
        {/* Spacer / cinematic negative space left */}
        <div className="hidden md:block flex-1" />

        {/* Right side panel */}
        <div className="w-full md:w-[520px] flex flex-col justify-center items-end px-8 md:pr-24 py-16 gap-10 animate-fadeIn">
          <div className="w-full flex flex-col items-end text-right">
            <h1
              className="text-6xl lg:text-8xl font-creepster text-red-700 tracking-widest leading-none animate-flicker drop-shadow-[0_0_15px_#7f0000]"
              style={{ textShadow: '0 0 12px #ff0000, 0 0 25px #7f0000' }}
            >
              SAN<br />GUBAT
            </h1>
            <p className="text-lg lg:text-2xl text-red-100/70 mt-3 tracking-[0.35em] font-medium">
              CHRONICLES
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-xs flex flex-col items-end gap-6"
          >
            <label htmlFor="playerName" className="text-sm tracking-wider uppercase text-gray-300/70">
              Enter your name, hunter
            </label>
            <input
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/30 backdrop-blur-sm border border-red-900/40 focus:border-red-500/80 focus:ring-2 focus:ring-red-700/40 transition text-xl text-red-100 tracking-wide px-4 py-3 outline-none placeholder-red-200/30"
              maxLength={20}
              required
              placeholder="Your Name"
            />
            <button
              type="submit"
              className="group self-stretch mt-1 bg-gradient-to-br from-red-800/80 to-red-900/80 border border-red-600/70 hover:from-red-700 hover:to-red-800 px-8 py-4 text-lg font-bold tracking-widest relative overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              <span className="relative z-10">ENTER THE DARKNESS</span>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_70%_50%,rgba(255,0,0,0.35),transparent_70%)]" />
            </button>
          </form>

          {/* Footer meta / subtle menu mock */}
          <div className="w-full mt-4 flex flex-col items-end gap-3 text-right text-xs tracking-wider text-gray-400/60">
            <div className="flex flex-col gap-1 opacity-80">
              <span className="uppercase text-[10px] text-gray-500/60">Build 0.1 • Pre-Alpha</span>
              <span className="text-[10px] text-gray-500/50">All noises are watching you.</span>
            </div>
            <ul className="hidden md:flex flex-col gap-1 text-[11px] text-gray-500/50">
              <li className="hover:text-red-400/80 transition cursor-pointer">Settings (coming soon)</li>
              <li className="hover:text-red-400/80 transition cursor-pointer">Credits</li>
              <li className="hover:text-red-400/80 transition cursor-pointer">Exit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interaction overlay for browsers blocking autoplay */}
      {!hasUserInteracted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center animate-fadeIn">
            <p className="text-sm mb-4 text-gray-300 tracking-wider">Tap / Click anywhere to enable sound</p>
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-red-600 flex items-center justify-center animate-pulse">
              <span className="text-red-400 text-xs">▶</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
          @keyframes startscreen-enter {
            0% { opacity:0; transform: scale(1.04) translateY(18px); filter: blur(4px) brightness(1.4); }
            35% { opacity:1; }
            60% { filter: blur(0px) brightness(1.05); }
            100% { opacity:1; transform: scale(1) translateY(0); filter: blur(0) brightness(1); }
          }
          .animate-startscreen-enter { animation: startscreen-enter 1.2s cubic-bezier(.55,.08,.25,1) both; }
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