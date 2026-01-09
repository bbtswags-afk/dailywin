import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PredictionFeed from '../components/features/PredictionFeed';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Settings, X, Save } from 'lucide-react';
import { api } from '../lib/api/client';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, login, updateLocalUser } = useAuth();
    const location = useLocation();
    const isNewUser = location.state?.isNewUser;

    const [viewMode, setViewMode] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Redirect Admins to Admin Panel
    React.useEffect(() => {
        if (user && user.role === 'admin') {
            window.location.href = '/admin';
        }
    }, [user]);

    // Profile Form State
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const greeting = isNewUser ? 'Welcome' : 'Welcome back';

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        // Validation
        if (password) {
            if (password !== confirmPassword) {
                setMessage("New passwords do not match.");
                setIsSaving(false);
                return;
            }
            if (!currentPassword) {
                setMessage("Please enter your current password to change it.");
                setIsSaving(false);
                return;
            }
        }

        try {
            const updates = {};
            if (name !== user.name) updates.name = name;
            if (password) {
                updates.password = password;
                updates.currentPassword = currentPassword;
            }

            if (Object.keys(updates).length === 0) {
                setMessage('No changes to save.');
                setIsSaving(false);
                return;
            }

            const updatedUser = await api.auth.updateProfile(updates);

            // Seamless Update
            updateLocalUser(updatedUser);

            setMessage('Profile updated successfully!');

            // Clear passwords
            setPassword('');
            setConfirmPassword('');
            setCurrentPassword('');

            // Close modal after short delay if successful
            setTimeout(() => {
                if (showSettings) setShowSettings(false);
                setMessage('');
            }, 1000);

        } catch (error) {
            console.error("Update failed", error);
            setMessage(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                {greeting}, {user?.name || 'User'}
                                <button
                                    onClick={() => {
                                        setName(user?.name || '');
                                        setShowSettings(true);
                                    }}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                    title="Edit Profile"
                                >
                                    <Settings className="w-5 h-5 text-muted-foreground hover:text-white" />
                                </button>
                            </h1>
                            <p className="text-muted-foreground">Here are your daily AI insights.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Upgrade Button for Free Users */}
                        {user?.plan === 'free' && (
                            <a
                                href="/upgrade"
                                className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 font-bold text-black shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
                            >
                                Upgrade to Premium
                            </a>
                        )}

                        {/* View Switcher for Testing/Preference */}
                        <button
                            onClick={() => setViewMode(viewMode === 'guest' ? null : 'guest')}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm text-muted-foreground hover:text-white"
                        >
                            {viewMode === 'guest' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {viewMode === 'guest' ? "Show My Plan" : "View as Guest"}
                        </button>
                    </div>
                </div>

                {/* Main Feed - Passing isDashboard={true} to suppress marketing content if needed */}
                <PredictionFeed viewMode={viewMode} isDashboard={true} />
            </div>

            {/* Profile Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowSettings(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-primary" />
                                Profile Settings
                            </h2>

                            {message && (
                                <div className={`mb-4 p-3 rounded text-sm text-center ${message.includes('success') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none"
                                        placeholder="Your Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed focus:outline-none"
                                    />
                                </div>

                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <h3 className="text-sm font-semibold text-white mb-3">Change Password</h3>

                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none pr-10"
                                                placeholder="Current Password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none pr-10"
                                                placeholder="New Password (min 8 chars)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none pr-10"
                                                placeholder="Confirm New Password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                                >
                                    {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default Dashboard;
