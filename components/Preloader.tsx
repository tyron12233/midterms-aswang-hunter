import React, { useEffect, useState, useRef } from 'react';
import { useLockScroll } from '../hooks/useLockScroll.ts';
import { useAudio } from '../context/AudioContext';

type AssetDescriptor = { name: string; src: string };

const IMAGE_ASSETS: AssetDescriptor[] = [
  { name: 'Background', src: '/assets/bg.png' },
  { name: 'Start Screen', src: '/assets/start.png' },
  { name: 'Albularyo', src: '/assets/askAlbularyo.png' },
  { name: 'Captain', src: '/assets/askCaptain.png' },
  { name: 'Church Entry', src: '/assets/oldChurch_entry.png' },
  { name: 'Altar', src: '/assets/altar.jpeg' },
  { name: 'Rice Fields', src: '/assets/ricefields_entry.jpeg' },
  { name: 'Tiyanak Investigation', src: '/assets/investigateTiyanak.jpeg' },
  { name: 'Final Fight Approach', src: '/assets/finalFight_approach.jpeg' },
  { name: 'Final Fight Direct', src: '/assets/finalFight_direct.png' },
  { name: 'Final Fight Search', src: '/assets/finalFight_search.png' },
  { name: 'Wakwak Jumpscare', src: '/assets/wakwak_jumpscare.jpeg' },
  { name: 'Wakwak No Garlic', src: '/assets/wakwak_noGarlic.png' },
  { name: 'Wakwak Use Garlic', src: '/assets/wakwak_useGarlic.jpeg' },
  { name: 'Good Ending', src: '/assets/goodEnding.jpeg' },
  { name: 'Bad Ending', src: '/assets/badEnding_noSalt.jpeg' },
  { name: 'Game Over', src: '/assets/gameOver_noHp.jpeg' },
];

const AUDIO_ASSETS: AssetDescriptor[] = [
  { name: 'Background Music', src: '/assets/sfx/bg-music.mp3' },
  { name: 'Jumpscare Sound', src: '/assets/sfx/jumpscare-1.mp3' },
  { name: 'Typewriter Sound', src: '/assets/sfx/typewriter-sound-effect-312919.mp3' },
  { name: 'Key Type 1', src: '/assets/sfx/single_key_type.wav' },
  { name: 'Key Type 2', src: '/assets/sfx/single_key_type_2.mp3' },
];

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  useLockScroll();
  const [progress, setProgress] = useState(0);
  const [currentAsset, setCurrentAsset] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'exiting'>('loading');
  const { preload } = useAudio();
  const startedRef = useRef(false);

  const horrorTips = [
    'Salt protects. Unless it is already inside.',
    'Not all cries are human.',
    'Some roots reach up because they remember.',
    'The wings you hear are not always above you.',
    'Garlic delays. Faith destroys.',
    'An Agimat chooses desperate hands.',
    'Never look directly into red eyes. They anchor.',
    'If it stops screaming too soon, it is listening.',
    'She leaves the lower half behind—but never alone.',
    'Blood that steams in moonlight is not yours yet.'
  ];

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    if (startedRef.current) return; // prevent double fire w/ strict mode
    startedRef.current = true;
    const preloadAssets = async () => {
      try {
        const totalAssets = IMAGE_ASSETS.length + AUDIO_ASSETS.length;
        let loadedCount = 0;

  for (const asset of IMAGE_ASSETS) {
          setCurrentAsset(`Harvesting memory: ${asset.name}`);
          try {
            await preloadImage(asset.src);
          } catch (err) {
            console.warn(`Failed to preload image: ${asset.name}`, err);
          }
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
          await delay(40); // subtle pacing for tension
        }

        setCurrentAsset('Binding echoes (audio)...');
        try {
          const audioSrcs = AUDIO_ASSETS.map(asset => asset.src);
          await preload(audioSrcs);
        } catch (err) {
          console.warn('Some audio files failed to preload', err);
        }
        loadedCount = totalAssets;
        setProgress(100);
        setCurrentAsset('It is awake.');
        setPhase('ready');
        // Orchestrated exit sequence: brief ominous stillness, flash, dissolve
        setTimeout(() => setPhase('exiting'), 650);
        setTimeout(() => onComplete(), 1800);
      } catch (err) {
        console.error('Preloading failed:', err);
        setError('Some sigils failed. The hunt proceeds regardless.');
        setTimeout(onComplete, 2500);
      }
    };
    preloadAssets();
  }, [preload, onComplete]);

  // Rotating horror tips
  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex(i => (i + 1) % horrorTips.length);
    }, 2600 + Math.random() * 1200);
    return () => clearInterval(id);
  }, []);

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black text-white overflow-hidden font-[Lato,ui-sans-serif] transition-opacity duration-1000 ${phase === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${phase === 'exiting' ? 'preloader-exit' : ''}`}
      aria-label="Loading game assets" role="alert" aria-live="polite">
      {/* Layered atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,#1a0000_0%,#050000_70%,#000_100%)] opacity-90" />
        <div className="absolute inset-0 mix-blend-screen opacity-[0.07] bg-[repeating-linear-gradient(45deg,#330000_0px,#330000_2px,#000_2px,#000_4px)] animate-scan" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute inset-0 vignette pointer-events-none" />
        {/* Subtle moving veins */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay animate-veins bg-[radial-gradient(circle_at_20%_30%,#5c0000_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#3a0000_0%,transparent_55%)]" />
      </div>

      {/* Decorative rotating runic ring */}
      <div className="absolute w-[780px] h-[780px] opacity-[0.08] animate-spin-slow pointer-events-none select-none">
        <div className="absolute inset-0 rounded-full border border-red-900/40 blur-[1px]" />
        <div className="absolute inset-[20px] rounded-full border border-red-800/30" />
        <div className="absolute inset-[40px] rounded-full border border-red-900/20" />
        <div className="absolute inset-[60px] text-[9px] font-mono tracking-[0.35em] text-red-900/40 uppercase leading-[1.1] p-6 rune-text">
          <div className="animate-spin-reverse-slower origin-center">
            SAN • GUBAT • THE • HUNT • THE • WINGS • THE • HALF • THE • VEINS • THE • ROOTS • THE • SILENCE • THE • HUNGER •
          </div>
        </div>
      </div>

      {/* Content Card */}
  <div className={`relative z-10 w-full max-w-xl mx-auto px-8 py-10 md:py-14 bg-black/40 backdrop-blur-[3px] border border-red-900/40 shadow-[0_0_25px_-5px_#a10000] rounded-xl overflow-hidden group transition-all duration-[1200ms] ${phase === 'exiting' ? 'scale-[0.94] blur-sm brightness-50' : 'scale-100'}`}>
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-xl pointer-events-none border border-red-800/30 shadow-[0_0_35px_-10px_#ff1a1a] animate-border-throb" />

        {/* Title */}
        <div className="text-center mb-10 select-none">
          <h1 className="font-creepster text-[2.9rem] md:text-[3.6rem] leading-none tracking-wider text-red-700 drop-shadow-[0_0_18px_#5c0000] title-flicker">
            <span className="inline-block animate-letter-flicker" style={{ animationDelay: '0.05s' }}>S</span>
            <span className="inline-block animate-letter-flicker" style={{ animationDelay: '0.15s' }}>A</span>
            <span className="inline-block animate-letter-flicker" style={{ animationDelay: '0.28s' }}>N</span>
            <span className="inline-block mx-2 opacity-70 animate-letter-flicker" style={{ animationDelay: '0.42s' }}>G</span>
            <span className="inline-block animate-letter-flicker" style={{ animationDelay: '0.55s' }}>U</span>
            <span className="inline-block animate-letter-flicker" style={{ animationDelay: '0.73s' }}>B</span>
            <span className="inline-block animate-letter-flicker" style={{ animationDelay: '0.86s' }}>A</span>
            <span className="inline-block animate-letter-flicker" style={{ animationDelay: '0.98s' }}>T</span>
          </h1>
          <p className="mt-2 tracking-[0.55em] text-[0.68rem] md:text-xs text-red-200/40 font-semibold uppercase">Chronicles • Asset Invocation</p>
        </div>

        {/* Progress Section */}
  <div className="relative mb-10">
          {/* Blood container */}
          <div className="relative w-full h-6 bg-gradient-to-b from-[#1a0101] to-[#060000] rounded-sm border border-red-950/70 overflow-hidden shadow-inner">
            <div
              className="absolute left-0 top-0 h-full blood-fill transition-[width] duration-[300ms] ease-out"
              style={{ width: `${progress}%` }}
              aria-label="Loading progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div className="absolute inset-0 mix-blend-screen opacity-40 bg-[linear-gradient(90deg,rgba(255,120,120,0.15)_0%,transparent_70%)] animate-sheen" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,180,180,0.35)_0%,transparent_60%)]" />
            </div>
            {/* Drips */}
            <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none overflow-visible">
              <div className="drip" style={{ left: `${Math.min(progress, 96)}%` }} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[0.65rem] md:text-[0.7rem] tracking-widest text-red-300/60 font-mono">
            <span>{Math.round(progress)}%</span>
            <span className="opacity-70 truncate max-w-[65%] text-right">{currentAsset}</span>
          </div>
        </div>

        {/* Rotating tips */}
        <div className="min-h-[54px] mb-8 relative text-center">
          <div key={tipIndex} className="text-sm text-red-100/70 tracking-wide animate-tip-fade px-2 font-light">
            {horrorTips[tipIndex]}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-400 text-xs mb-6 p-3 border border-red-800/70 rounded bg-gradient-to-br from-red-950/60 to-red-900/10 backdrop-blur-sm animate-pulse shadow-[0_0_12px_-2px_#ff2d2d]">
            {error}
          </div>
        )}

        {/* Subtle pulsers */}
        <div className="flex items-center justify-center gap-3 mt-2 opacity-70">
          <div className="w-3 h-3 rounded-full bg-red-700 animate-pulse-fast shadow-[0_0_8px_2px_#ff1a1a]" />
          <div className="w-3 h-3 rounded-full bg-red-800 animate-pulse-mid shadow-[0_0_8px_1px_#b30000]" />
          <div className="w-3 h-3 rounded-full bg-red-900 animate-pulse-slow shadow-[0_0_7px_1px_#660000]" />
        </div>

        {/* Ambient line */}
        <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/60 to-transparent animate-ambient-glow" />
      </div>

      {/* Floating glyphs */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[10px] font-mono text-red-900/30 animate-glyph-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${8 + Math.random() * 10}s`,
            }}
          >
            ✶
          </div>
        ))}
      </div>

      {/* Flash / flare overlays during exit */}
      {phase === 'exiting' && (
        <>
          <div className="pointer-events-none fixed inset-0 z-[60] bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.15)_0%,transparent_70%)] animate-flare-fade" />
          <div className="pointer-events-none fixed inset-0 z-[65] exit-flash-layer" />
        </>
      )}

      <style>{`
        .grain-overlay { background: repeating-conic-gradient(from 0deg,#000 0deg,#000 10deg,#0a0000 10deg,#0a0000 20deg); mix-blend-mode: overlay; filter: contrast(140%) brightness(80%); animation: grain-move 1.4s steps(5) infinite; }
        .vignette { box-shadow: inset 0 0 220px 60px #000, inset 0 0 520px 120px #000; }
        .blood-fill { background: linear-gradient(180deg,#8b0000 0%,#5c0000 55%,#220000 100%); position: relative; }
        .drip { position:absolute; width:14px; height:30px; background: radial-gradient(circle at 45% 20%,#ff2d2d 0%,#7a0000 55%,#300 90%); border-bottom-left-radius:40% 60%; border-bottom-right-radius:60% 80%; filter: drop-shadow(0 0 6px #4d0000); transform: translateX(-50%); animation: drip-fall 2.4s linear infinite; }
        .rune-text { font-family: 'Lato', monospace; text-transform: uppercase; }
        .preloader-exit { animation: exit-dissolve 1.55s cubic-bezier(.55,.1,.45,.9) forwards; }
        .exit-flash-layer { background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,0,0,0.25) 18%, rgba(0,0,0,0.9) 55%, #000 80%); mix-blend-mode: overlay; animation: flash-burst 1s ease-out forwards; }
        @keyframes flash-burst { 0% { opacity:0; filter: blur(4px); } 10% { opacity:1; filter: blur(2px) brightness(1.4); } 25% { opacity:.25; } 40% { opacity:.9; } 65% { opacity:.15; } 100% { opacity:0; filter: blur(6px); } }
        @keyframes flare-fade { 0% { opacity:0; } 30% { opacity:.8; } 100% { opacity:0; } }
        .animate-flare-fade { animation: flare-fade 1.4s ease-out forwards; }
        @keyframes exit-dissolve { 0% { opacity:1; filter:none; } 35% { opacity:1; } 55% { opacity:.85; filter:brightness(.85); } 75% { opacity:.5; filter: blur(2px) brightness(.55) contrast(120%); } 100% { opacity:0; filter: blur(6px) brightness(.25); } }
        @keyframes drip-fall { 0% { transform: translate(-50%, -55%) scaleY(0.2); opacity:0; } 15% { opacity:1; } 55% { transform: translate(-50%, 0%) scaleY(1); } 90% { opacity:0.2; } 100% { transform: translate(-50%, 120%) scaleY(0.3); opacity:0; } }
        @keyframes sheen { 0% { opacity:0; transform: translateX(-30%) skewX(-15deg); } 40% { opacity:0.45; } 60% { opacity:0; } 100% { opacity:0; transform: translateX(120%) skewX(-15deg); } }
        .animate-sheen { animation: sheen 2.8s ease-in-out infinite; }
        @keyframes scan { 0%,100% { opacity:.08; } 50% { opacity:.18; } }
        .animate-scan { animation: scan 5.5s ease-in-out infinite; }
        @keyframes veins { 0% { transform: scale(1) translateY(0); } 50% { transform: scale(1.03) translateY(6px); } 100% { transform: scale(1) translateY(0); } }
        .animate-veins { animation: veins 14s ease-in-out infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 120s linear infinite; }
        @keyframes spin-reverse-slower { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .animate-spin-reverse-slower { animation: spin-reverse-slower 260s linear infinite; }
        @keyframes border-throb { 0%,100% { box-shadow: 0 0 35px -12px #ff2d2d; opacity:.6; } 50% { box-shadow: 0 0 55px -10px #ff4545; opacity:1; } }
        .animate-border-throb { animation: border-throb 5s ease-in-out infinite; }
        @keyframes letter-flicker { 0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity:1; filter: drop-shadow(0 0 8px #ff1a1a) drop-shadow(0 0 22px #5c0000); } 19%, 23%, 54% { opacity:0.35; filter:none; } 24%, 56% { opacity:0.65; filter: drop-shadow(0 0 3px #3a0000); } }
        .animate-letter-flicker { animation: letter-flicker 6.8s linear infinite; }
        @keyframes tip-fade { 0% { opacity:0; transform: translateY(8px) scale(.98); filter: blur(2px); } 8% { opacity:1; transform: translateY(0) scale(1); filter: blur(0); } 88% { opacity:1; } 100% { opacity:0; transform: translateY(-6px) scale(.985); filter: blur(2px); } }
        .animate-tip-fade { animation: tip-fade 2.8s ease-in-out forwards; }
        @keyframes pulse-fast { 0%,100% { opacity:.3; transform: scale(.9); } 50% { opacity:1; transform: scale(1.15); } }
        .animate-pulse-fast { animation: pulse-fast 1.2s ease-in-out infinite; }
        @keyframes pulse-mid { 0%,100% { opacity:.25; transform: scale(.9); } 50% { opacity:1; transform: scale(1.12); } }
        .animate-pulse-mid { animation: pulse-mid 2.1s ease-in-out infinite; }
        @keyframes pulse-slow { 0%,100% { opacity:.2; transform: scale(.88); } 50% { opacity:1; transform: scale(1.1); } }
        .animate-pulse-slow { animation: pulse-slow 3.2s ease-in-out infinite; }
        @keyframes ambient-glow { 0%,100% { opacity:.2; filter: blur(2px); } 50% { opacity:.9; filter: blur(4px); } }
        .animate-ambient-glow { animation: ambient-glow 5.8s ease-in-out infinite; }
        @keyframes glyph-float { 0% { transform: translateY(0) scale(.8) rotate(0deg); opacity:0; } 10% { opacity:.4; } 50% { opacity:.55; } 90% { opacity:.15; } 100% { transform: translateY(-140vh) scale(1.4) rotate(360deg); opacity:0; } }
        .animate-glyph-float { animation: glyph-float linear infinite; }
        @keyframes grain-move { 0%,100% { transform: translate(0,0); } 10% { transform: translate(-2%,1%); } 20% { transform: translate(1%,-1%); } 30% { transform: translate(-1%,2%); } 40% { transform: translate(2%,1%); } 50% { transform: translate(-2%, -1%); } 60% { transform: translate(2%,2%); } 70% { transform: translate(-1%,1%); } 80% { transform: translate(1%, -2%); } 90% { transform: translate(-2%,1%); } }
      `}</style>
    </div>
  );
};

export default Preloader;