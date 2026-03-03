import React from 'react';
import { CheckCircle, XCircle, Clock, ArrowLeft, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const History = () => {
    const [historyData, setHistoryData] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Use relative path if proxied, or absolute VITE_API_URL
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${apiUrl}/predictions/history`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setHistoryData(data);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Stats calculation
    const completedGames = historyData.filter(g => g.result === 'WON' || g.result === 'LOST');
    const totalGames = completedGames.length;
    const wins = completedGames.filter(g => g.result === 'WON').length;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header / Nav */}
            <div className="border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        AI Performance History
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 text-center"
                >
                    <p className="text-muted-foreground mb-2 text-sm uppercase tracking-wider font-semibold">
                        Overall Accuracy (Last {totalGames} Completed)
                    </p>
                    <div className="text-5xl sm:text-7xl font-bold text-emerald-400 mb-2">
                        {winRate}%
                    </div>
                    <p className="text-sm text-white/60">
                        {wins} Wins / {totalGames - wins} Losses
                    </p>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && historyData.length === 0 && (
                    <div className="text-center py-20 bg-card/30 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-muted-foreground italic">No prediction history available yet.</p>
                        <p className="text-xs text-white/40 mt-2">Predictions will appear here once games have finished.</p>
                    </div>
                )}

                {/* Games List */}
                <div className="space-y-3">
                    {historyData.map((game, i) => (
                        <motion.div
                            key={game.id || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-card/50 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(game.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                                    <span>{game.league}</span>
                                </div>
                                <div className="font-semibold text-lg">
                                    {game.homeTeam} <span className="text-muted-foreground text-sm font-normal">vs</span> {game.awayTeam}
                                </div>
                                <div className="text-sm mt-1">
                                    Prediction: <span className="text-blue-300 font-medium">{game.prediction}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 min-w-[140px]">
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground text-center">Result</div>
                                    <div className="font-mono text-lg text-center">{game.score || 'vs'}</div>
                                </div>

                                {game.result === 'WON' ? (
                                    <div className="flex flex-col items-center text-emerald-400 w-12">
                                        <CheckCircle className="h-6 w-6" />
                                        <span className="text-[10px] font-bold mt-1">WON</span>
                                    </div>
                                ) : game.result === 'LOST' ? (
                                    <div className="flex flex-col items-center text-red-400 w-12">
                                        <XCircle className="h-6 w-6" />
                                        <span className="text-[10px] font-bold mt-1">LOST</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 w-12">
                                        <Clock className="h-6 w-6" />
                                        <span className="text-[10px] font-bold mt-1">PENDING</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-8 text-xs text-muted-foreground">
                    * Results are verified against official match data.
                </div>
            </div>
        </div>
    );
};

export default History;
