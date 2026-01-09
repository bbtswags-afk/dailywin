import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';
import FilterBar from './FilterBar';
import { api } from '../../lib/api/client';
import { useAuth } from '../../context/AuthContext'; // To know if user is logged in
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import FeaturesSection from '../layout/FeaturesSection';


const PredictionFeed = ({ viewMode, isDashboard = false }) => {
    const [games, setGames] = useState([]);
    const [filter, setFilter] = useState('all');
    const [displayedGames, setDisplayedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleUpgrade = async () => {
        try {
            await api.auth.upgrade();
            alert("Upgrade Successful! You are now a Premium Member.");
            window.location.reload();
        } catch (error) {
            console.error("Upgrade failed", error);
            alert("Upgrade failed. Please try again.");
        }
    };

    const handleUnlockClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate('/upgrade');
        }
    };

    useEffect(() => {
        const loadPredictions = async () => {
            setLoading(true);
            try {
                const data = await api.predictions.getAll(viewMode);
                setGames(data);
            } catch (error) {
                console.error("Failed to load predictions", error);
            } finally {
                setLoading(false);
            }
        };

        loadPredictions();
    }, [user, viewMode]);

    useEffect(() => {
        if (filter === 'all') {
            setDisplayedGames(games);
        } else {
            setDisplayedGames(games.filter(g => {
                if (g.category) return g.category === filter || (filter === 'safe' && g.confidence >= 90);
                // Fallback
                if (filter === 'safe') return g.confidence >= 90 || g.prediction === "Over 1.5 Goals";
                if (filter === 'goals') return g.prediction.includes("Goals");
                if (filter === 'win') return g.prediction.includes("Win");
                if (filter === 'corners') return g.prediction.includes("Corners");
                if (filter === 'double') return g.prediction.includes("1X") || g.prediction.includes("X2");
                return true;
            }));
        }
    }, [filter, games]);

    return (
        <section id="predictions" className="w-full max-w-5xl mx-auto">
            {/* Show Header only if NOT in Dashboard (Dashboard has its own header) */}
            {!isDashboard && (
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Today's Smart Picks</h2>
                    <p className="text-muted-foreground">AI-Verified Opportunities tailored for low risk.</p>
                </div>
            )}

            <FilterBar activeCategory={filter} onSelect={setFilter} />

            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-card/40 h-48 animate-pulse p-5">
                            <div className="h-4 bg-white/5 rounded w-1/3 mb-6" />
                            <div className="h-6 bg-white/5 rounded w-3/4 mb-4" />
                            <div className="h-6 bg-white/5 rounded w-3/4 mb-4" />
                            <div className="h-4 bg-white/5 rounded w-1/4 mt-6 ml-auto" />
                        </div>
                    ))
                ) : (
                    displayedGames.map((game) => (
                        <div key={game.id} className="relative group">
                            {/* Locked Overlay */}
                            {game.isLocked && (
                                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-yellow-500/20">
                                    <Lock className="w-10 h-10 text-yellow-500 mb-3" />
                                    <h3 className="text-xl font-bold text-white mb-1">Premium Advice</h3>
                                    <p className="text-sm text-yellow-200/80 mb-4">High Value Prediction</p>
                                    <button
                                        onClick={handleUnlockClick}
                                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-colors shadow-lg shadow-yellow-500/20"
                                    >
                                        {user ? "Subscribe to Unlock" : "Login to Subscribe"}
                                    </button>
                                </div>
                            )}

                            <GameCard
                                game={game}
                                isGuest={!user || viewMode === 'guest'}
                            />
                        </div>
                    ))
                )}
            </motion.div>

            {displayedGames.length === 0 && !loading && (
                <div className="text-center py-20 text-muted-foreground">
                    {filter === 'all'
                        ? "No matches available right now. Check back later!"
                        : "No games match this filter criteria."}
                </div>
            )}

            {/* Features Section ONLY for Guest View AND when NOT in Dashboard */}
            {(!user || viewMode === 'guest') && !loading && !isDashboard && (
                <div className="mt-20">
                    <FeaturesSection />
                </div>
            )}

            {/* Payment Modal */}

        </section>
    );
};

export default PredictionFeed;
