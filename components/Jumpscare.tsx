import React, { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';

interface JumpscareProps {
  imageSrc: string;
  soundSrc: string;
  onComplete: () => void;
  /** Optional seconds offset to start playing the jumpscare sound from */
  soundStartAt?: number;
}

const Jumpscare: React.FC<JumpscareProps> = ({ imageSrc, soundSrc, onComplete, soundStartAt = 0 }) => {
  const [visible, setVisible] = useState(true);

  const { triggerSfx } = useAudio();

  useEffect(() => {
    // Play SFX with a subtle fade out; keep max duration short so it doesn't linger.
    triggerSfx(soundSrc, { volume: 1, fadeOut: 0.4, maxDuration: 1.5, startAt: soundStartAt });
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 1500);
    return () => clearTimeout(timer);
  }, [soundSrc, onComplete, triggerSfx, soundStartAt]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative w-full h-full animate-jump-scare">
        <img
          src={imageSrc}
          alt="A horrifying creature"
          className={`object-cover w-full h-full transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <style>{`
            @keyframes jump-scare-animation {
                0% { transform: scale(1) rotate(0deg); opacity: 0.8; }
                10% { transform: scale(1.2) rotate(-2deg); opacity: 1; }
                20% { transform: scale(1.1) rotate(2deg); }
                30% { transform: scale(1.25) rotate(-1deg); }
                40% { transform: scale(1.15) rotate(1deg); }
                50% { transform: scale(1.3) rotate(0deg); }
                100% { transform: scale(1.3) rotate(0deg); opacity: 1; }
            }
            .animate-jump-scare {
                animation: jump-scare-animation 1.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default Jumpscare;