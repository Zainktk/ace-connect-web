import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

import { useConfig } from '../context/ConfigContext';

export const Layout = ({ children }: { children: ReactNode }) => {
    const { user, logout } = useAuth();
    const { config } = useConfig();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans">
            <nav className="glass sticky top-0 z-50 border-b border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center cursor-pointer flex-shrink-0 group" onClick={() => navigate('/dashboard')}>
                            <span className="text-2xl font-black text-[#ccff00] transition-all group-hover:drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]">{config.brand_name}</span>
                        </div>

                        {user ? (
                            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar ml-4">
                                <Link to="/dashboard" className="text-zinc-400 hover:text-[#ccff00] font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap">Home</Link>
                                <Link to="/find-match" className="text-zinc-400 hover:text-[#ccff00] font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap">Play</Link>
                                <Link to="/events" className="text-zinc-400 hover:text-[#ccff00] font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap">Events</Link>
                                <Link to="/players" className="text-zinc-400 hover:text-[#ccff00] font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap">Pro List</Link>
                                <Link to="/chat" className="text-zinc-400 hover:text-[#ccff00] font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap">Inbox</Link>

                                <div className="h-6 w-px bg-zinc-800 mx-1 flex-shrink-0"></div>

                                <Button variant="secondary" onClick={logout} className="text-[10px] px-3 py-1 font-black uppercase tracking-tighter">
                                    Exit
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-zinc-400 hover:text-[#ccff00] font-bold text-xs uppercase tracking-widest transition-colors">Login</Link>
                                <Button onClick={() => navigate('/register')} variant="neon" className="text-[10px] px-4 py-1 font-black uppercase tracking-tighter">
                                    Join Now
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-grow w-full py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            <footer className="bg-[#09090b] border-t border-zinc-900 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} {config.brand_name}. {config.brand_slogan}.
                    </p>
                </div>
            </footer>
        </div>
    );
};
