import React, { useEffect, useState } from 'react';

interface JumpscareProps {
  imageSrc: string;
  soundSrc: string;
  onComplete: () => void;
}

const Jumpscare: React.FC<JumpscareProps> = ({ imageSrc, soundSrc, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const audio = new Audio(soundSrc);
    audio.play().catch(error => console.error("Audio play failed:", error));

    const timer = setTimeout(() => {
      setVisible(false);
      // Allow fade-out animation to complete before calling onComplete
      setTimeout(onComplete, 500); 
    }, 1500); // Jumpscare duration

    return () => clearTimeout(timer);
  }, [soundSrc, onComplete]);

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
        <div className="relative w-full h-full animate-jump-scare">
            <img 
                src={imageSrc} 
                alt="A horrifying creature" 
                className="object-cover w-full h-full"
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