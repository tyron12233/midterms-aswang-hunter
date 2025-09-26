import React, { useMemo } from 'react';
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
    const severity: 'high' | 'mid' | 'low' = hpPercentage > 60 ? 'high' : hpPercentage > 30 ? 'mid' : 'low';

    const inventoryDisplay = useMemo(() => {
        if (!state.inventory.length) return '— NONE —';
        return state.inventory
            .map(item => item.toUpperCase())
            .join(' • ');
    }, [state.inventory]);

    return (
        <>
            <div className="fixed top-0 right-0 z-30 px-3 sm:px-6 pt-3 sm:pt-5 pointer-events-none select-none hud-veil">
                <div className="flex flex-col items-end gap-3 sm:gap-4 pointer-events-auto w-full max-w-[320px] sm:max-w-[360px]">
                    {/* Player Block */}
                    <div className="hud-panel player-name-panel w-full">
                        <div className="font-creepster text-2xl tracking-wider drop-shadow-[0_0_6px_#6e0000] text-red-500/90 player-name-glow">
                            {state.playerName || 'HUNTER'}
                        </div>
                        <div className="mt-1 text-[0.55rem] tracking-[0.35em] text-red-200/40 font-semibold uppercase">San Gubat Operative</div>
                    </div>

                    {/* Stats Block */}
                    <div className="hud-panel flex flex-col items-end gap-4 w-full min-w-[240px] sm:min-w-[260px]">
                        {/* HP */}
                        <div className="w-full" aria-label="Health" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={hpPercentage}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[0.6rem] tracking-[0.4em] text-red-200/50 font-semibold uppercase">VITALS</span>
                                <span className={`text-[0.65rem] font-mono tracking-wider hp-text-${severity}`}>{hpPercentage.toFixed(0)}%</span>
                            </div>
                            <div className={`relative h-5 rounded-sm overflow-hidden hp-shell severity-${severity}`}>
                                <div className={`absolute inset-y-0 left-0 hp-bar-inner severity-${severity}`}
                                         style={{ width: `${hpPercentage}%` }} />
                                {/* Texture & overlay */}
                                <div className="absolute inset-0 mix-blend-overlay opacity-40 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0_3px,transparent_3px_6px)]" />
                                <div className="absolute inset-0 pointer-events-none blood-sheen" />
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[0.6rem] tracking-[0.4em] text-red-200/50 font-semibold uppercase">RELICS</span>
                                <InventoryIcon className="w-4 h-4 text-red-300/50" />
                            </div>
                            <div className="inventory-badge text-[0.6rem] leading-relaxed tracking-[0.25em]">
                                {inventoryDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .hud-veil { text-shadow: 0 0 4px rgba(0,0,0,0.9); }
                .hud-panel { background: linear-gradient(140deg, rgba(15,0,0,0.75) 0%, rgba(5,0,0,0.4) 55%, rgba(50,0,0,0.25) 100%); backdrop-filter: blur(6px) saturate(120%); border: 1px solid rgba(120,0,0,0.35); box-shadow: 0 0 12px -4px #400, inset 0 0 18px -10px #f00; padding: 0.9rem 1rem 1rem; border-radius: 6px; position: relative; overflow: hidden; }
                .hud-panel:before { content:""; position:absolute; inset:0; background: radial-gradient(circle at 20% 15%, rgba(255,40,40,0.18), transparent 60%); opacity:.4; pointer-events:none; }
                .player-name-panel { min-width: 170px; }
                .player-name-glow { animation: nameGlow 6s ease-in-out infinite; }
                @keyframes nameGlow { 0%,100% { filter: drop-shadow(0 0 6px #380000); } 50% { filter: drop-shadow(0 0 14px #7a0000); } }

                .hp-shell { background: linear-gradient(180deg,#1d0000,#0a0000); border:1px solid rgba(255,0,0,0.25); position:relative; }
                .hp-bar-inner { height:100%; position:relative; transition: width .6s cubic-bezier(.55,.1,.3,1); }
                .hp-bar-inner:after { content:""; position:absolute; inset:0; background:linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0)); mix-blend-mode:overlay; opacity:.4; }
                .blood-sheen { background: linear-gradient(120deg, transparent 0%, rgba(255,140,140,0.35) 45%, transparent 70%); animation: sheenMove 4.8s linear infinite; }
                @keyframes sheenMove { 0% { transform: translateX(-80%); } 100% { transform: translateX(160%); } }

                .severity-high.hp-shell { box-shadow: 0 0 10px -4px rgba(255,60,60,0.25), inset 0 0 14px -10px #ff5959; }
                .severity-mid.hp-shell { box-shadow: 0 0 12px -2px rgba(255,140,0,0.3), inset 0 0 10px -6px #c54; }
                .severity-low.hp-shell { animation: lowPulse 2.2s ease-in-out infinite; box-shadow: 0 0 16px -4px rgba(255,0,0,0.5), inset 0 0 14px -6px #800; }
                @keyframes lowPulse { 0%,100% { filter: brightness(.85); } 50% { filter: brightness(1.2) contrast(115%); } }

                .severity-high.hp-bar-inner { background: linear-gradient(90deg,#6dff9e,#34c759); }
                .severity-mid.hp-bar-inner { background: linear-gradient(90deg,#ffc648,#ff7b1f); }
                .severity-low.hp-bar-inner { background: linear-gradient(90deg,#ff2d2d,#7a0000); animation: bloodFlow 3.4s linear infinite; }
                @keyframes bloodFlow { 0% { background-position:0 0; } 100% { background-position: 160px 0; } }

                .hp-text-high { color:#7dffb1; text-shadow:0 0 4px rgba(0,180,80,0.5); }
                .hp-text-mid { color:#ffc15c; text-shadow:0 0 4px rgba(255,140,0,0.5); }
                .hp-text-low { color:#ff4d4d; text-shadow:0 0 6px rgba(255,0,0,0.7); animation: hpFlash 1.2s steps(2,end) infinite; }
                @keyframes hpFlash { 0%,55% { opacity:1; } 60%,68% { opacity:.35; } 75%,100% { opacity:1; } }

                .inventory-badge { background: linear-gradient(180deg,rgba(60,0,0,0.55),rgba(25,0,0,0.55)); border:1px solid rgba(150,0,0,0.4); padding: .55rem .7rem .6rem; border-radius: 3px; font-family: 'Lato', monospace; letter-spacing: .25em; color: #e6c9c9; position:relative; overflow:hidden; }
                .inventory-badge:before { content:""; position:absolute; inset:0; background: radial-gradient(circle at 80% 30%, rgba(255,30,30,0.18), transparent 70%); opacity:.4; }
                .inventory-badge:after { content:""; position:absolute; bottom:-40%; left: -10%; width:140%; height:180%; background: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 4px, transparent 4px 8px); opacity:.15; mix-blend-mode:overlay; }

                /* Subtle film line across top for ambiance */
                .hud-veil:after { content:""; position:fixed; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(255,0,0,0.4),transparent); opacity:.4; animation: scanLine 7s linear infinite; pointer-events:none; }
                @keyframes scanLine { 0% { transform: translateX(-30%); opacity:.1; } 40% { opacity:.6; } 100% { transform: translateX(30%); opacity:.15; } }
            `}</style>
        </>
    );
};

export default Hud;