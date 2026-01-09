import React, { useEffect, useState } from 'react';
import { getLiveScores } from '../lib/api/football';
import { Loader2, RefreshCw } from 'lucide-react';

import MatchDetailsModal from '../components/live/MatchDetailsModal';

const LiveScores = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);

    // Premier League (39), FA Cup (45), League Cup (48)
    // La Liga (140), Copa del Rey (143)
    // Serie A (135), Coppa Italia (137)
    // Bundesliga (78), DFB Pokal (81)
    // Ligue 1 (61), Coupe de France (66)
    // UCL (2), UEL (3)
    const TOP_LEAGUE_IDS = [39, 45, 48, 140, 143, 135, 137, 78, 81, 61, 66, 2, 3];

    const fetchScores = async () => {
        setLoading(true);
        const data = await getLiveScores();
        // Filter for Top 5 Leagues
        const filtered = data.response.filter(match => TOP_LEAGUE_IDS.includes(match.league.id));
        setScores(filtered);
        setLoading(false);
    };

    useEffect(() => {
        fetchScores();
        // Auto-refresh every 30s
        const interval = setInterval(fetchScores, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Live Scores <span className="text-sm font-normal text-muted-foreground ml-2">(Top 5 Leagues)</span></h1>
                <button
                    onClick={fetchScores}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-4">
                {scores.map((match) => (
                    <div key={match.fixture.id} className="bg-card/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:bg-card/60">
                        {/* Time & Teams */}
                        <div className="flex items-center justify-between w-full md:w-5/12 gap-4">
                            <span className="text-xs font-bold w-12 text-center shrink-0">
                                {match.fixture.status.short === 'LIVE' || match.fixture.status.short === '1H' || match.fixture.status.short === '2H' ? (
                                    <span className="text-red-500 animate-pulse">{match.fixture.status.elapsed}''</span>
                                ) : (
                                    <span className="text-muted-foreground">{match.fixture.status.short}</span>
                                )}
                            </span>

                            <div className="flex flex-col flex-1 pl-2 border-l border-white/5">
                                <span className="font-bold text-white text-sm md:text-base flex items-center justify-between gap-2 py-1">
                                    <div className="flex items-center gap-2">
                                        <img src={match.teams.home.logo} className="w-5 h-5 object-contain" alt="" />
                                        <span className="truncate">{match.teams.home.name}</span>
                                    </div>
                                    <span className="font-mono">{match.goals.home ?? 0}</span>
                                </span>
                                <span className="font-bold text-white text-sm md:text-base flex items-center justify-between gap-2 py-1">
                                    <div className="flex items-center gap-2">
                                        <img src={match.teams.away.logo} className="w-5 h-5 object-contain" alt="" />
                                        <span className="truncate">{match.teams.away.name}</span>
                                    </div>
                                    <span className="font-mono">{match.goals.away ?? 0}</span>
                                </span>
                            </div>
                        </div>

                        {/* Middle Status/Score (Desktop Only - Mobile shows formatted score above) */}
                        <div className="hidden md:flex flex-col items-center justify-center w-2/12">
                            {match.fixture.status.short === 'NS' ? (
                                <span className="text-lg font-bold text-muted-foreground">
                                    {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : (
                                <div className="text-xl font-black text-white bg-black/20 px-3 py-1 rounded border border-white/5">
                                    {match.goals.home ?? 0} - {match.goals.away ?? 0}
                                </div>
                            )}
                        </div>

                        {/* League Info */}
                        <div className="w-full md:w-4/12 flex items-center justify-between md:justify-end gap-2 text-xs text-muted-foreground border-t md:border-t-0 border-white/5 pt-2 md:pt-0 mt-2 md:mt-0">
                            <div className="flex items-center gap-2">
                                <img src={match.league.logo} className="w-4 h-4 object-contain opacity-70" alt="" />
                                <span>{match.league.name}</span>
                            </div>
                            {match.fixture.status.short === 'NS' && (
                                <span className="md:hidden text-white font-mono">
                                    {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                {scores.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground py-10">
                        No live games in the Top 5 Leagues at the moment.
                    </div>
                )}
            </div>

            {selectedMatch && (
                <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
            )}
        </div>
    );
};

export default LiveScores;
