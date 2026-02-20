import React from 'react';
import { Button } from './Button';

interface GamificationInfoProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GamificationInfo: React.FC<GamificationInfoProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-[#ccff00]/5 blur-3xl" />

                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6 relative z-10">PLAYER PROGRESSION</h2>

                <div className="space-y-6 relative z-10">
                    <section>
                        <h3 className="text-[#ccff00] text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span>🔥</span> STREAKS
                        </h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Log in or play matches daily to increase your streak. High streaks signify elite activity and dedication.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-[#ccff00] text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span>⚡</span> EXPERIENCE (XP)
                        </h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Earn XP for everything you do! You get 10 XP just for logging in, and more for inviting players or joining events.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-[#ccff00] text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span>🏆</span> LEVELS
                        </h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Every 1,000 XP you reach a new Level. Higher levels unlock premium badges and community respect.
                        </p>
                    </section>
                </div>

                <div className="mt-8 relative z-10">
                    <Button variant="neon" className="w-full rounded-2xl py-6 text-sm" onClick={onClose}>
                        GOT IT, COACH
                    </Button>
                </div>
            </div>
        </div>
    );
};
