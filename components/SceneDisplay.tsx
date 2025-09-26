import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { storyData } from '../context/GameContext';
import { useTypewriter } from '../hooks/useTypewriter';
import { useAudio } from '../context/AudioContext';
import typewriterSfx from '../assets/sfx/typewriter-sound-effect-312919.mp3';

import singleKeyType2Sfx from '../assets/sfx/single_key_type_2.mp3'
import singkeKeyTypeSfx from '../assets/sfx/single_key_type.wav';

const SceneDisplay: React.FC = () => {
  const { state, dispatch } = useGame();
  const [showChoices, setShowChoices] = useState(false);
  const [skipped, setSkipped] = useState(false);
  // Advanced layered background transition system
  // Each layer animates independently to create seamless cinematic transitions
  const initialScene = storyData[state.currentScene];
  interface BgLayer { id: number; src: string; entering: boolean; exiting: boolean; variant: 'normal' | 'scare'; }
  const idRef = useRef(0);
  const [bgLayers, setBgLayers] = useState<BgLayer[]>(() => [{
    id: idRef.current++,
    src: initialScene?.background || `https://picsum.photos/seed/${state.currentScene}/1920/1080`,
    entering: true,
    exiting: false,
    variant: initialScene?.jumpScare ? 'scare' : 'normal'
  }]);
  const [flashActive, setFlashActive] = useState(false);


  const scene = storyData[state.currentScene];
  const displayedText = useTypewriter(scene ? scene.text : '', 20);
  const isTyping = scene ? displayedText.length < scene.text.length : false;
  const { triggerSfx } = useAudio();
  const prevLenRef = useRef(0);

  // Play short typewriter ticks while text is revealing
  useEffect(() => {
    if (!scene || skipped) return;
    const currentLen = displayedText.length;
    // Only when new character appears
    if (currentLen > prevLenRef.current && currentLen <= scene.text.length) {
      // Throttle: play every 2 characters to avoid audio clutter
      if (currentLen % 8 === 0) {
        const sfx = Math.random() < 0.5 ? singleKeyType2Sfx : singkeKeyTypeSfx;

        triggerSfx(singleKeyType2Sfx, { volume: 0.4, maxDuration: 3 });
      }
    }
    prevLenRef.current = currentLen;
  }, [displayedText, scene, skipped, triggerSfx]);



  // Background transition layering logic
  useEffect(() => {
    const nextScene = storyData[state.currentScene];
    const nextBg = nextScene?.background || `https://picsum.photos/seed/${state.currentScene}/1920/1080`;
    const isScare = !!nextScene?.jumpScare;
    setBgLayers(prev => {
      // Mark current top layer as exiting
      const updated = prev.map((l, i, arr) => i === arr.length - 1 ? { ...l, exiting: true } : l);
      return [...updated, {
        id: idRef.current++,
        src: nextBg,
        entering: true,
        exiting: false,
        variant: isScare ? 'scare' : 'normal'
      }];
    });
    // Timed cleanup & state updates
    const enterTimeout = setTimeout(() => {
      setBgLayers(prev => prev.map(l => l.entering ? { ...l, entering: false } : l));
    }, 900);
    const cleanupTimeout = setTimeout(() => {
      setBgLayers(prev => prev.filter(l => !l.exiting));
    }, 2500);
    if (isScare) {
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 650);
    }
    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(cleanupTimeout);
    };
  }, [state.currentScene]);

  // Reset state on scene change
  useEffect(() => {
    setShowChoices(false);
    setSkipped(false);
    prevLenRef.current = 0; // reset typewriter progress for sfx
  }, [state.currentScene]);

  // Effect for showing choices after text is done typing or is skipped
  useEffect(() => {
    if (scene && (!isTyping || skipped)) {
      const timer = setTimeout(() => setShowChoices(true), scene.isEnding ? 500 : 150);
      return () => clearTimeout(timer);
    }
  }, [isTyping, skipped, scene]);

  // Effect for acknowledging screen shake from damage
  useEffect(() => {
    if (state.damageTaken) {
      const timer = setTimeout(() => {
        dispatch({ type: 'ACKNOWLEDGE_DAMAGE' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.damageTaken, dispatch]);

  const handleSkip = () => {
    if (isTyping && !skipped) {
      setSkipped(true);
    }
  };

  const handleChoice = (to: string) => {
    const nextScene = storyData[to];
    // Add a small delay for visual feedback if needed
    dispatch({ type: 'MAKE_CHOICE', payload: { scene: nextScene, to } });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  if (!scene) {
    return (
      <div className="relative w-full h-screen flex flex-col justify-center items-center text-center p-8">
        <h2 className="text-3xl text-red-500 font-creepster">Error: Scene Not Found</h2>
        <p className="text-gray-400 mt-4">The path has grown dark. Could not find data for "{state.currentScene}".</p>
        <button
          onClick={handleReset}
          className="mt-8 px-8 py-3 font-bold text-lg text-white bg-red-800/80 border border-red-600 rounded-sm hover:bg-red-700 transition-all"
        >
          RETURN TO THE START
        </button>
      </div>
    );
  }

  const filteredChoices = scene.choices?.filter(choice => {
    const hasRequired = !choice.requires || state.inventory.includes(choice.requires);
    const isHidden = choice.hideIf && state.inventory.includes(choice.hideIf);
    return hasRequired && !isHidden;
  }) || [];

  const screenShakeClass = state.damageTaken ? 'animate-shake' : '';
  const skipCursorClass = isTyping && !skipped ? 'cursor-pointer' : 'cursor-default';

  return (
    <div
      className={`relative w-full h-screen flex flex-col justify-between overflow-hidden ${screenShakeClass} ${skipCursorClass}`}
      onClick={handleSkip}
    >
      {/* Layered Backgrounds */}
      <div className="absolute inset-0">
        {bgLayers.map(layer => (
          <div
            key={layer.id}
            className={`absolute inset-0 bg-center bg-cover will-change-transform bg-layer 
              ${layer.entering ? (layer.variant === 'scare' ? 'bg-enter-scare' : 'bg-enter') : ''}
              ${layer.exiting ? 'bg-exit' : ''}`}
            style={{ backgroundImage: `url('${layer.src}')` }}
          />
        ))}
        {/* Overlays & atmospheric effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 film-grain" />
        {flashActive && (
          <div className="absolute inset-0 pointer-events-none flash-overlay" />
        )}
        {/* Subtle moving fog */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.12] fog-layer" />
      </div>

      {/* Top Section: Story Caption */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 pt-24 md:pt-28">
        <div className="story-wrapper">
          <div className="story-inner">
            <p className={`story-text ${isTyping && !skipped ? 'typing-active' : ''}`}
              aria-live="polite"
              aria-atomic="true">
              {skipped ? scene.text : displayedText}
              {isTyping && !skipped && <span className="caret" aria-hidden="true" />}
            </p>
            {isTyping && !skipped && (
              <div className="skip-hint" aria-hidden="true">CLICK TO SKIP</div>
            )}
          </div>
          <div className="story-overlay" />
        </div>
      </div>

      {/* Bottom Section: Choices */}
      <div className="relative z-10 p-8 md:p-12 w-full max-w-5xl mx-auto text-center choice-region">
        <div className="flex flex-col gap-7 min-h-[240px]">
          {showChoices && (
            scene.isEnding ? (
              <button
                onClick={handleReset}
                className="ending-button opacity-0 animate-fadeInUp"
                style={{ animationDelay: '0.15s' }}
              >
                PLAY AGAIN
                <span className="ending-glow" />
              </button>
            ) : (
              filteredChoices.map((choice, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); handleChoice(choice.to); }}
                  className="choice-btn opacity-0 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.18}s` }}
                >
                  <span className="choice-label">{choice.text}</span>
                  <span className="choice-ink" aria-hidden="true" />
                </button>
              ))
            )
          )}
        </div>
      </div>
      <style>{`
        /* Background animation system */
        .bg-layer { transition: filter 1.2s ease; }
        @keyframes bgEnter {
          0% { opacity:0; transform: scale(1.12) translateY(14px); filter: brightness(0.4) saturate(60%) contrast(120%) blur(2px); }
          35% { opacity:1; }
          70% { filter: brightness(0.9) saturate(95%) contrast(105%) blur(0.5px); }
          100% { opacity:1; transform: scale(1.04) translateY(0); filter: brightness(1) saturate(100%) contrast(105%) blur(0); }
        }
        .bg-enter { animation: bgEnter 2.8s cubic-bezier(.55,.1,.25,1) forwards; }
        @keyframes bgEnterScare {
          0% { opacity:0; transform: scale(1.18) translateY(25px) rotate(0.4deg); filter: brightness(0.3) contrast(140%) saturate(40%) blur(3px); }
          18% { opacity:1; }
          32% { filter: brightness(1.15) contrast(160%) saturate(155%) blur(0.6px); }
          46% { filter: brightness(0.85) contrast(115%) saturate(110%) blur(0.3px); }
          60% { filter: brightness(1) contrast(108%) saturate(105%) blur(0); }
          100% { opacity:1; transform: scale(1.06) translateY(0); }
        }
        .bg-enter-scare { animation: bgEnterScare 2.4s cubic-bezier(.6,.05,.2,.95) forwards, scareFlicker 1.3s linear 0.2s 1; }
        @keyframes bgExit {
          0% { opacity:1; transform: scale(1.04); filter: brightness(1) contrast(105%); }
          60% { opacity:.4; filter: brightness(0.55) contrast(125%) blur(2px); }
          100% { opacity:0; transform: scale(1.1); filter: brightness(0.3) contrast(140%) blur(6px); }
        }
        .bg-exit { animation: bgExit 2.2s cubic-bezier(.55,.1,.45,.9) forwards; }
        @keyframes scareFlicker {
          0%, 12%, 16%, 24%, 55%, 100% { filter: none; }
          13% { filter: hue-rotate(-25deg) brightness(1.4) contrast(180%); }
          17% { filter: brightness(0.6) contrast(160%) saturate(160%); }
          25% { filter: brightness(1.25) contrast(150%) saturate(140%); }
          42% { filter: brightness(0.9) contrast(140%); }
        }
        .flash-overlay { background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(180,0,0,0.4) 28%, rgba(0,0,0,0.8) 70%, #000 100%); animation: flashPulse 0.65s ease-out forwards; mix-blend-mode: overlay; }
        @keyframes flashPulse { 0% { opacity:0; } 10% { opacity:1; } 45% { opacity:.4; } 100% { opacity:0; } }
        .fog-layer { background: radial-gradient(circle at 30% 60%, rgba(255,255,255,0.05) 0%, transparent 60%),
                                  radial-gradient(circle at 70% 40%, rgba(255,255,255,0.04) 0%, transparent 65%);
          animation: fogShift 22s ease-in-out infinite; filter: blur(18px) contrast(140%);
        }
        @keyframes fogShift { 0% { transform: scale(1) translate(0,0); opacity:.12; } 50% { transform: scale(1.15) translate(2%, -3%); opacity:.2; } 100% { transform: scale(1) translate(0,0); opacity:.12; } }
        .story-wrapper { position:relative; background:linear-gradient(180deg,rgba(10,0,0,.55),rgba(0,0,0,.75)); border:1px solid rgba(120,0,0,0.35); border-radius:8px; padding: 1.3rem 1.35rem 1.5rem; overflow:hidden; box-shadow:0 0 22px -8px #000, inset 0 0 18px -12px #ff2d2d40; }
        .story-wrapper:before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 65% 35%,rgba(255,30,30,0.08),transparent 70%); mix-blend-mode: overlay; }
        .story-overlay { pointer-events:none; position:absolute; inset:0; background:
          repeating-linear-gradient(0deg,rgba(255,0,0,0.04)_0_2px,transparent_2px_4px);
          opacity:.25; mix-blend-mode: overlay; animation: storyScan 11s linear infinite; }
        @keyframes storyScan { 0% { background-position:0 0; } 100% { background-position:0 400px; } }
        .story-inner { position:relative; }
        .story-text { font-size:1.15rem; line-height:1.55; letter-spacing:.04em; font-family:'Lato', sans-serif; font-weight:400; color:#e8dede; text-shadow: 0 0 6px rgba(0,0,0,0.9), 0 0 18px rgba(140,0,0,0.25); }
        @media (min-width:768px){ .story-text { font-size:1.28rem; } }
        .story-text.typing-active { filter:brightness(1.07) contrast(108%); }
        .story-text:first-letter { font-family:'Creepster', cursive; font-size:2.55rem; line-height:1; color:#ff2d2d; padding-right:6px; text-shadow:0 0 8px #7a0000,0 0 22px #ff3939; float:left; }
        .caret { display:inline-block; width:10px; height:1.25rem; background:linear-gradient(180deg,#ff4747,#8b0000); margin-left:4px; box-shadow:0 0 6px #ff1111; animation: caretPulse .9s steps(2,end) infinite; transform: translateY(3px); }
        @keyframes caretPulse { 0%,60% { opacity:1; } 61%,100% { opacity:0; } }
        .skip-hint { position:absolute; bottom:-0.6rem; right:0.4rem; font-size:.55rem; letter-spacing:.45em; color:rgba(255,180,180,0.35); font-weight:600; animation: skipFade 2.4s ease-in-out infinite; }
        @keyframes skipFade { 0%,70% { opacity:.4; } 80% { opacity:1; } 100% { opacity:.4; } }

        /* Choices */
        .choice-region { position:relative; }
        .choice-btn { position:relative; background:rgba(10,0,0,0.45); border:1px solid rgba(100,0,0,0.4); padding:1rem 1.25rem 1.2rem; border-radius:6px; font-family:'Creepster', cursive; font-size:2.15rem; letter-spacing:.06em; color:#bfa9a9; text-shadow:0 0 10px rgba(70,0,0,0.65); transition: all .4s cubic-bezier(.55,.12,.22,1); overflow:hidden; backdrop-filter: blur(2px) brightness(1.05); width:100%; }
        @media (min-width:768px){ .choice-btn { font-size:2.6rem; } }
        .choice-btn .choice-label { position:relative; z-index:2; display:inline-block; padding:0 .35rem; }
        .choice-btn:before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 35%,rgba(255,60,60,0.07),transparent 70%); opacity:.5; mix-blend-mode: overlay; transition:inherit; }
        .choice-btn .choice-ink { position:absolute; inset:0; background:
            radial-gradient(circle at 20% 75%,rgba(255,0,0,0.22),transparent 55%),
            radial-gradient(circle at 80% 30%,rgba(255,60,60,0.18),transparent 60%),
            repeating-linear-gradient(35deg,rgba(255,0,0,0.08)_0_6px,transparent_6px_12px);
          opacity:0; filter: blur(8px) contrast(180%); transform:scale(1.4); transition: all .8s ease; mix-blend-mode: screen; }
        .choice-btn:hover { color:#ffeaea; transform:translateY(-6px) scale(1.035); border-color:rgba(255,60,60,0.6); box-shadow:0 12px 28px -12px rgba(255,0,0,0.4), 0 0 28px -6px rgba(255,30,30,0.55); text-shadow:0 0 14px #ff3b3b,0 0 30px #a10000; }
        .choice-btn:hover .choice-ink { opacity:.9; transform:scale(1.01); filter: blur(1.5px) contrast(140%); }
        .choice-btn:active { transform:translateY(-2px) scale(1.01); filter:brightness(.9); }
        .choice-btn:focus-visible { outline:2px solid #ff3d3d; outline-offset:4px; }
        .choice-btn:not(:hover) { animation: choiceIdle 9s ease-in-out infinite; }
        @keyframes choiceIdle { 0%,100% { filter:brightness(.95); } 50% { filter:brightness(1.05); } }

        .ending-button { position:relative; background:linear-gradient(160deg,#3a0000,#140000); border:1px solid #6e0000; padding:1rem 2.4rem; font-family:'Creepster',cursive; font-size:2.2rem; letter-spacing:.14em; color:#ffb3b3; text-shadow:0 0 16px #7a0000,0 0 32px #300; transition: all .5s ease; overflow:hidden; }
        .ending-button .ending-glow { position:absolute; inset:0; background:
            radial-gradient(circle at 50% 50%,rgba(255,60,60,0.3),transparent 70%),
            repeating-linear-gradient(45deg,rgba(255,0,0,0.08)_0_10px,transparent_10px_20px);
          opacity:.25; mix-blend-mode:overlay; animation: endPulse 5.5s ease-in-out infinite; }
        .ending-button:hover { color:#fff; transform:translateY(-4px) scale(1.04); border-color:#ff3d3d; box-shadow:0 0 40px -6px #ff2d2d; }
        @keyframes endPulse { 0%,100% { opacity:.15; } 50% { opacity:.55; } }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes grain { 0%, 100% { transform: translate(0, 0); } 10% { transform: translate(-1%, -2%); } 20% { transform: translate(2%, 1%); } 30% { transform: translate(-2%, -1%); } 40% { transform: translate(1%, 2%); } 50% { transform: translate(-1%, 1%); } 60% { transform: translate(2%, -2%); } 70% { transform: translate(-2%, 2%); } 80% { transform: translate(1%, -1%); } 90% { transform: translate(-1%, 2%); } }
        .film-grain::after { content: ""; position: absolute; top: -100%; left: -100%; width: 300%; height: 300%; background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVpaWl9fX1cXFxbW1t/f39wcHDBwcGjo6NsbGxvb29FRUVNTU1QUFBSUlJcXFxfX19ra2uEhISioqKhkaLNzMwAAAAAAABgwsEyAAAAAXRSTlMAQObYZgAAAAlwSFlzAAAALEgAACxIB0t1+/AAAAApSURBVDjL7c0BCQAwDMCg+z+0biflpq5MIMIIw4vLr3a1b41L5gRRBRTfIEQxX240JAAAAABJRU5ErkJggg=='); opacity: 0.08; pointer-events: none; animation: grain 1s steps(1) infinite; }
      `}</style>
    </div>
  );
};

export default SceneDisplay;