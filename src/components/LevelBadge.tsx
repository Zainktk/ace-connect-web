import React from 'react';

interface LevelBadgeProps {
    level: number;
    className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className = '' }) => {
    const getRank = (lvl: number) => {
        if (lvl < 5) return { label: 'ROOKIE', color: 'text-zinc-400' };
        if (lvl < 15) return { label: 'AMATEUR', color: 'text-green-400' };
        if (lvl < 30) return { label: 'SEMI-PRO', color: 'text-blue-400' };
        if (lvl < 50) return { label: 'PRO', color: 'text-[#ccff00]' };
        return { label: 'ELITE', color: 'text-purple-400 font-black italic' };
    };

    const rank = getRank(level);

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm ${className}`}>
            <div className={`text-[10px] font-black tracking-tighter ${rank.color}`}>
                {rank.label}
            </div>
            <div className="h-1 w-1 rounded-full bg-zinc-700" />
            <div className="text-[10px] font-mono text-zinc-500">LVL {level}</div>
        </div>
    );
};
