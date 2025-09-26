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
  // Track backgrounds for smooth cross-fade. Use scene.background if provided.
  const initialScene = storyData[state.currentScene];
  const [backgrounds, setBackgrounds] = useState<{
    current: string;
    previous: string | null;
  }>(() => ({
    current: initialScene?.background || `https://picsum.photos/seed/${state.currentScene}/1920/1080`,
    previous: null,
  }));


  const scene = storyData[state.currentScene];
  const displayedText = useTypewriter(scene ? scene.text : '', 20);
  const isTyping = scene ? displayedText.length < scene.text.length : false;
  const { triggerSfx, preload } = useAudio();
  const prevLenRef = useRef(0);

  // Preload typewriter sound once
  useEffect(() => {
    preload(singkeKeyTypeSfx);
    preload(singleKeyType2Sfx);
  }, [preload]);

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



  // Effect for background transitions; prefer scene.background if present
  useEffect(() => {
    const nextScene = storyData[state.currentScene];
    const nextBg = nextScene?.background || `https://picsum.photos/seed/${state.currentScene}/1920/1080`;
    setBackgrounds(prev => ({
      current: nextBg,
      previous: prev.current,
    }));
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
      {/* Background Setup */}
      {backgrounds.previous && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-0"
          style={{
            backgroundImage: `url('${backgrounds.previous}')`,
            //  filter: 'grayscale(80%) brightness(0.5) contrast(1.2)',
          }}
        ></div>
      )}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-100"
        style={{
          backgroundImage: `url('${backgrounds.current}')`,
          //  filter: 'grayscale(80%) brightness(0.5) contrast(1.2)',
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
      <div className="absolute inset-0 film-grain"></div>

      {/* Top Section: Story Caption */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-24 md:pt-28">
        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-md">
          <p
            className="text-lg md:text-xl leading-relaxed text-gray-200 text-center"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            {skipped ? scene.text : displayedText}
            {isTyping && !skipped && <span className="inline-block animate-pulse">|</span>}
          </p>
        </div>
      </div>

      {/* Bottom Section: Choices */}
      <div className="relative z-10 p-8 md:p-12 w-full max-w-4xl mx-auto text-center">
        <div className="space-y-6 min-h-[250px]">
          {showChoices && (scene.isEnding ? (
            <button
              onClick={handleReset}
              className="px-8 py-3 font-bold text-lg text-white bg-red-900/80 border border-red-700 rounded-sm hover:bg-red-800 transition-all duration-300 ease-in-out transform hover:scale-105 opacity-0 animate-fadeInUp"
              style={{ animationDelay: '0.2s' }}
            >
              PLAY AGAIN
            </button>
          ) : (
            filteredChoices.map((choice, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent skip click when clicking a choice
                  handleChoice(choice.to);
                }}
                className="block w-full text-2xl md:text-3xl text-gray-300 hover:text-white font-creepster tracking-wider transition-all duration-300 opacity-0 animate-fadeInUp choice-button"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {choice.text}
              </button>
            ))
          ))}
        </div>
      </div>
      <style>{`
        .choice-button {
            text-shadow: 0 0 8px rgba(200, 50, 50, 0.5);
            transition: all 0.3s ease;
        }
        .choice-button:hover {
            text-shadow: 0 0 12px rgba(255, 80, 80, 0.9), 0 0 20px rgba(255, 80, 80, 0.6);
            transform: scale(1.03);
            color: #fff;
        }
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
        @keyframes grain {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-1%, -2%); }
            20% { transform: translate(2%, 1%); }
            30% { transform: translate(-2%, -1%); }
            40% { transform: translate(1%, 2%); }
            50% { transform: translate(-1%, 1%); }
            60% { transform: translate(2%, -2%); }
            70% { transform: translate(-2%, 2%); }
            80% { transform: translate(1%, -1%); }
            90% { transform: translate(-1%, 2%); }
        }
        .film-grain::after {
            content: "";
            position: absolute;
            top: -100%; left: -100%;
            width: 300%; height: 300%;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVpaWl9fX1cXFxbW1t/f39wcHDBwcGjo6NsbGxvb29FRUVNTU1QUFBSUlJcXFxfX19ra2uEhISioqKhkaLNzMwAAAAAAABgwsEyAAAAAXRSTlMAQObYZgAAAAlwSFlzAAAALEgAACxIB0t1+/AAAAApSURBVDjL7c0BCQAwDMCg+z+0biflpq5MIMIIw4vLr3a1b41L5gRRBRTfIEQxX240JAAAAABJRU5ErkJggg==');
            opacity: 0.08;
            pointer-events: none;
            animation: grain 1s steps(1) infinite;
        }
      `}</style>
    </div>
  );
};

export default SceneDisplay;