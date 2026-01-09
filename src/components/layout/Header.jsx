import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const isActive = (path) => {
        return location.pathname === path ? "text-primary font-bold bg-white/10 px-3 py-1 rounded-full" : "text-muted-foreground hover:text-primary";
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <img src="/logo.png" alt="Dailywin AI" className="h-10 w-10 object-contain drop-shadow-glow" />
                    <span className="text-2xl font-black tracking-tighter text-white">
                        Dailywin<span className="text-emerald-400">.AI</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                    <Link to="/" className={isActive('/')}>Home</Link>
                    <Link to="/live" className={isActive('/live')}>Live Scores</Link>
                    <Link to="/history" className={isActive('/history')}>History</Link>
                    <Link to="/premium" className={isActive('/premium')}>Premium</Link>
                    <Link to="/about" className={isActive('/about')}>About AI</Link>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {/* Upgrade CTA */}
                                {user.plan !== 'premium' && (
                                    <Link
                                        to="/upgrade"
                                        className="hidden lg:flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1.5 rounded-full hover:shadow-[0_0_10px_rgba(255,165,0,0.5)] transition-all transform hover:scale-105"
                                    >
                                        <Star className="w-3 h-3 text-black fill-black" /> UPGRADE
                                    </Link>
                                )}
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-medium text-white flex items-center gap-1 justify-end">
                                        {user.name || user.email}
                                        {user.plan === 'premium' && (
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                        {user.plan === 'premium' ? 'Premium Member' : 'Free Account'}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="h-9 flex items-center justify-center rounded-md bg-white/10 px-4 text-sm font-medium transition-colors hover:bg-white/20"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Mobile User Indicator */}
                    {user && (
                        <div className="md:hidden flex items-center gap-2 mr-2">
                            {user.plan === 'premium' ? (
                                <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-bold text-yellow-400">PRO</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                                    <User className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs font-bold text-muted-foreground">FREE</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-foreground/60 hover:text-foreground"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0f1c] border-b border-white/10 p-4 shadow-2xl animate-in slide-in-from-top-5">
                    <nav className="flex flex-col gap-4">
                        {/* User Info Card in Mobile Menu */}
                        {user && (
                            <div className="bg-white/5 rounded-xl p-4 mb-2 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{user.name || 'User'}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                        Current Plan:
                                    </div>
                                    {user.plan === 'premium' ? (
                                        <div className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400" /> PREMIUM MEMBER
                                        </div>
                                    ) : (
                                        <div className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
                                            FREE ACCOUNT
                                        </div>
                                    )}
                                </div>
                                {user.plan !== 'premium' && (
                                    <Link to="/upgrade" className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-2 rounded-lg text-sm">
                                        <Star className="w-4 h-4 fill-black text-black" /> Upgrade to Premium
                                    </Link>
                                )}
                            </div>
                        )}

                        <Link to="/" className={`text-center ${isActive('/')}`} onClick={() => setIsMobileOpen(false)}>Home</Link>
                        <Link to="/live" className={`text-center ${isActive('/live')}`} onClick={() => setIsMobileOpen(false)}>Live Scores</Link>
                        <Link to="/history" className={`text-center ${isActive('/history')}`} onClick={() => setIsMobileOpen(false)}>History</Link>
                        <Link to="/premium" className={`text-center ${isActive('/premium')}`} onClick={() => setIsMobileOpen(false)}>Premium</Link>
                        <Link to="/about" className={`text-center ${isActive('/about')}`} onClick={() => setIsMobileOpen(false)}>About AI</Link>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="h-10 w-full rounded-md bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 mt-2"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3 mt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileOpen(false)}
                                    className="h-10 flex items-center justify-center w-full rounded-md bg-white/5 text-sm font-medium hover:bg-white/10"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsMobileOpen(false)}
                                    className="h-10 flex items-center justify-center w-full rounded-md bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
