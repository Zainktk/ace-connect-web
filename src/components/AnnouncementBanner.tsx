import React, { useState } from 'react';

interface AnnouncementBannerProps {
    title: string;
    message: string;
    icon?: string;
    className?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ title, message, icon = '🎾', className = '' }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className={`relative overflow-hidden rounded-2xl glass border border-zinc-800 p-4 transition-all hover:border-zinc-700 ${className}`}>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-[#ccff00]/10 blur-2xl" />

            <div className="flex gap-4 items-start relative z-10">
                <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shadow-inner">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-black text-zinc-50 text-sm tracking-tight">{title}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed mt-0.5">{message}</p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-zinc-600 hover:text-zinc-400 p-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
