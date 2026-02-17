import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const Layout = ({ children }: { children: ReactNode }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => navigate('/dashboard')}>
                            <span className="text-2xl font-bold text-green-600">AceConnect</span>
                        </div>

                        {user ? (
                            <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar ml-4">
                                <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Dashboard</Link>
                                <Link to="/find-match" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Match</Link>
                                <Link to="/events" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Events</Link>
                                <Link to="/players" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Players</Link>
                                <Link to="/chat" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Messages</Link>
                                {user.role === 'organizer' && (
                                    <Link to="/create-event" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Create Event</Link>
                                )}
                                <div className="h-6 w-px bg-gray-200 mx-2 flex-shrink-0"></div>
                                <Link to="/profile" className="text-gray-700 text-sm hidden md:block hover:text-green-600 hover:underline whitespace-nowrap">
                                    {user.email}
                                </Link>
                                <Button variant="secondary" onClick={logout} className="text-xs px-3 py-1 flex-shrink-0">
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium">Login</Link>
                                <Button onClick={() => navigate('/register')} className="text-xs px-3 py-1">
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} AceConnect. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};
