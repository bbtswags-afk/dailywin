import React, { useState } from 'react';
import { ChevronDown, Trophy, TrendingUp, AlertTriangle, ShieldCheck, Activity, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const GameCard = ({ game, isGuest = false }) => {
    const [expanded, setExpanded] = useState(false);

    // Destructure with defaults... (Lines 10-25 omitted for brevity in thought, but included in logic)
    const {
        homeTeam = "Home Team",
        awayTeam = "Away Team",
        homeLogo,
        awayLogo,
        league = "League",
        time = "00:00",
        prediction = "N/A",
        confidence = 0,
        odds = "0.00",
        type = "straight",
        h2h = "N/A",
        form = { home: [], away: [] },
        manipulationCheck = true,
        volatilityReason = "High Risk Match",
        reasoning = "AI Analysis loading..."
    } = game || {};

    const getConfidenceColor = (score) => {
        if (typeof score !== 'number') return "text-gray-500";
        if (score >= 90) return "text-emerald-400";
        if (score >= 75) return "text-blue-400";
        return "text-yellow-400";
    };

    return (
        <motion.div
            layout
            className={cn(
                "group relative overflow-hidden rounded-xl border border-white/5 bg-card/40 backdrop-blur-sm transition-all hover:border-white/10",
                !isGuest && "hover:bg-card/60"
            )}
        >
            <div
                className={cn("p-5", !isGuest && "cursor-pointer")}
                onClick={() => !isGuest && setExpanded(!expanded)}
            >
                {/* Header: League & Time */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wider font-semibold">{league}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{time}</span>
                    </div>
                    {/* HIDE BADGES FOR GUESTS */}
                    {!isGuest && (
                        manipulationCheck ? (
                            <div className="flex items-center gap-1 text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3" /> Safe
                            </div>
                        ) : (
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] font-medium border border-yellow-500/20 animate-pulse">
                                    <AlertTriangle className="w-3 h-3" /> Volatile
                                </div>
                                <span className="text-[9px] text-red-400 font-mono tracking-tight">{volatilityReason}</span>
                            </div>
                        )
                    )}
                </div>

                {/* Teams & Score Placeholder */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            {homeLogo && <img src={homeLogo} alt={homeTeam} className="w-8 h-8 object-contain" />}
                            <span className="text-lg font-bold text-white group-hover:text-primary transition-colors">{homeTeam}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-11">vs</span>
                        <div className="flex items-center gap-3">
                            {awayLogo && <img src={awayLogo} alt={awayTeam} className="w-8 h-8 object-contain" />}
                            <span className="text-lg font-bold text-white group-hover:text-primary transition-colors">{awayTeam}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">AI Prediction</div>
                        <div className="text-xl font-black tracking-tight text-white mb-1">
                            {prediction}
                        </div>
                        <div className={cn("text-sm font-bold flex items-center justify-end gap-1", getConfidenceColor(confidence))}>
                            {typeof confidence === 'number' ? `${confidence}% Prob.` : (confidence === 'HIDDEN' ? 'Locked' : confidence)}
                        </div>
                    </div>
                </div>

                {/* Footer: Odds & Expand */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="bg-secondary/50 px-3 py-1 rounded-md text-sm font-mono text-white/80">
                            Wait: <span className="text-white font-bold">{odds}</span>
                        </div>
                        {isGuest ? (
                            <a href="/login" className="text-xs text-primary hover:underline font-medium">
                                Login to view analysis
                            </a>
                        ) : (
                            <div className="text-xs text-muted-foreground">
                                Click for analysis
                            </div>
                        )}
                    </div>
                    {!isGuest && (
                        <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", expanded ? "rotate-180" : "")} />
                    )}
                </div>
            </div>

            {/* Expanded Stats Section */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/20"
                    >
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                            {game.requiresLogin ? (
                                <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                                    <Lock className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                                    <h4 className="text-xl font-bold text-white mb-2">Detailed Analysis Locked</h4>
                                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                        Log in to unlock the full AI reasoning, head-to-head stats, and recent form analysis for this match.
                                    </p>
                                    <Link to="/login" className="inline-flex items-center px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20">
                                        Log In to Unlock
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* AI Strategy Analysis */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-white font-semibold mb-3">
                                            <Activity className="w-4 h-4 text-purple-400" /> AI Insights
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {reasoning || "AI pattern recognition suggests this outcome based on recent form."}
                                        </p>
                                    </div>

                                    {/* Form Analysis */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-white font-semibold mb-3">
                                            <TrendingUp className="w-4 h-4 text-emerald-400" /> Recent Form
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">{homeTeam}</span>
                                                <div className="flex gap-1">
                                                    {form.home?.map((res, i) => (
                                                        <span key={i} className={cn(
                                                            "w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold border",
                                                            res === 'W' ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                                                                res === 'L' ? "bg-red-500/20 border-red-500/40 text-red-400" :
                                                                    "bg-gray-500/20 border-gray-500/40 text-gray-400"
                                                        )}>{res}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">{awayTeam}</span>
                                                <div className="flex gap-1">
                                                    {form.away?.map((res, i) => (
                                                        <span key={i} className={cn(
                                                            "w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold border",
                                                            res === 'W' ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                                                                res === 'L' ? "bg-red-500/20 border-red-500/40 text-red-400" :
                                                                    "bg-gray-500/20 border-gray-500/40 text-gray-400"
                                                        )}>{res}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GameCard;
