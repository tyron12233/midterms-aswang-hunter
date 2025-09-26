import React from 'react';
import { useGame } from '../hooks/useGame';
import { Briefcase } from 'lucide-react';

const HealthIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

const InventoryIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);


const Hud: React.FC = () => {
    const { state } = useGame();
    const hpPercentage = Math.max(0, state.hp);
    const hpColor = hpPercentage > 60 ? 'bg-green-500' : hpPercentage > 30 ? 'bg-yellow-500' : 'bg-red-600';

    return (
        <div className="fixed top-0 left-0 right-0 z-20 p-4 md:p-6 text-white text-sm pointer-events-none">
            <div className="container mx-auto flex justify-between items-start">
                {/* Left Side: Player Name */}
                <div className="bg-black/40 p-3 rounded-md backdrop-blur-sm">
                    <div className="font-bold text-lg tracking-wider font-creepster">{state.playerName}</div>
                </div>

                {/* Right Side: Stats */}
                <div className="flex flex-col items-end space-y-3 bg-black/40 p-3 rounded-md backdrop-blur-sm">
                    {/* HP Bar */}
                    <div className="flex items-center space-x-3 w-48">
                        <HealthIcon className={`w-6 h-6 flex-shrink-0 ${hpPercentage > 30 ? 'text-red-500' : 'text-red-700 animate-pulse'}`} />
                        <div className="w-full bg-gray-700/50 rounded-full h-4 border border-gray-600">
                             <div 
                                className={`h-full rounded-full ${hpColor} transition-all duration-500 ease-out`}
                                style={{ width: `${hpPercentage}%` }}
                             ></div>
                        </div>
                    </div>
                     {/* Inventory */}
                    <div className="flex items-center space-x-3 self-end">
                        <InventoryIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300 text-base">
                            {state.inventory.length > 0 ? state.inventory.join(', ') : 'Empty'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hud;