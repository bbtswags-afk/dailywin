
import React, { useState, useEffect } from 'react';
import { X, Users, BarChart2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getFixtureLineups, getFixtureStatistics } from '../../lib/api/football';

const MatchDetailsModal = ({ match, onClose }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ lineups: [], stats: [] });

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [lineupsData, statsData] = await Promise.all([
                    getFixtureLineups(match.fixture.id),
                    getFixtureStatistics(match.fixture.id)
                ]);

                setData({
                    lineups: lineupsData.response,
                    stats: statsData.response
                });
            } catch (e) {
                console.error("Details fetch error", e);
            } finally {
                setLoading(false);
            }
        };

        if (match) fetchDetails();
    }, [match]);

    if (!match) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-4xl bg-[#030811] border border-white/10 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-emerald-900/10"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <img src={match.teams.home.logo} className="w-8 h-8" alt="" />
                            <span className="text-xl font-bold text-white">{match.goals.home ?? 0} - {match.goals.away ?? 0}</span>
                            <img src={match.teams.away.logo} className="w-8 h-8" alt="" />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        {[
                            { id: 'stats', label: 'Overview', icon: BarChart2 },
                            { id: 'lineups', label: 'Lineups', icon: Users },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative",
                                    activeTab === tab.id ? "text-emerald-400" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
                        ) : (
                            <div className="space-y-6">
                                {/* STATS VIEW */}
                                {activeTab === 'stats' && (
                                    <div className="space-y-4">
                                        {data.stats.length > 0 ? (
                                            ['Ball Possession', 'Shots on Goal', 'Corner Kicks', 'Fouls'].map(type => {
                                                const homeStat = data.stats[0]?.statistics.find(s => s.type === type)?.value || 0;
                                                const awayStat = data.stats[1]?.statistics.find(s => s.type === type)?.value || 0;
                                                // Parse if string (possession is usually "50%")
                                                const hVal = parseInt(homeStat);
                                                const aVal = parseInt(awayStat);
                                                const total = hVal + aVal || 1;

                                                return (
                                                    <div key={type} className="space-y-1">
                                                        <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-wider">
                                                            <span>{homeStat}</span>
                                                            <span>{type}</span>
                                                            <span>{awayStat}</span>
                                                        </div>
                                                        <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                                                            <div style={{ width: `${(hVal / total) * 100}% ` }} className="bg-emerald-500" />
                                                            <div style={{ width: `${(aVal / total) * 100}% ` }} className="bg-blue-500" />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : <div className="text-center text-muted-foreground">No statistics available yet.</div>}
                                    </div>
                                )}

                                {/* LINEUPS VIEW */}
                                {activeTab === 'lineups' && (
                                    <div className="grid grid-cols-2 gap-8">
                                        {data.lineups.map((team, idx) => (
                                            <div key={idx}>
                                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                    <img src={team.team.logo} className="w-4 h-4" alt="" />
                                                    {team.formation}
                                                </h4>
                                                <div className="space-y-2">
                                                    {team.startXI.map(p => (
                                                        <div key={p.player.id} className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <span className="w-6 text-right text-xs opacity-50">{p.player.number}</span>
                                                            <span className="text-white">{p.player.name}</span>
                                                            <span className="text-xs text-emerald-400">{p.player.pos}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {data.lineups.length === 0 && <div className="col-span-2 text-center text-muted-foreground">Lineups not available.</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MatchDetailsModal;
