import React from 'react';

interface XPProgressProps {
    xp: number;
    level: number;
    className?: string;
}

export const XPProgress: React.FC<XPProgressProps> = ({ xp, level, className = '' }) => {
    // Basic level calculation logic for demonstration
    // Assuming 1000 XP per level for simplicity
    const xpPerLevel = 1000;
    const currentLevelXP = xp % xpPerLevel;
    const progressPercent = (currentLevelXP / xpPerLevel) * 100;

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <div className="bg-[#ccff00] text-black h-8 w-8 rounded-full flex items-center justify-center font-black text-sm shadow-[0_0_10px_rgba(204,255,0,0.5)]">
                        {level}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest leading-none">Level</p>
                        <p className="text-zinc-50 font-black leading-tight italic">AMATEUR</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest leading-none">Next Level</p>
                    <p className="font-mono text-xs text-zinc-300">{currentLevelXP} / {xpPerLevel} XP</p>
                </div>
            </div>

            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                <div
                    className="h-full bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.3)] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};
