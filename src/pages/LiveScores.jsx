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
                    <div key={match.fixture.id} className="bg-card/40 border border-white/5 rounded-xl p-4 flex items-center justify-between transition-all hover:bg-card/60">
                        <div className="flex items-center gap-4 w-1/3">
                            <span className="text-xs text-muted-foreground w-12 text-center">
                                {match.fixture.status.short === 'LIVE' || match.fixture.status.short === '1H' || match.fixture.status.short === '2H' ? (
                                    <span className="text-red-500 font-bold animate-pulse">{match.fixture.status.elapsed}'</span>
                                ) : match.fixture.status.short}
                            </span>
                            <div className="flex flex-col">
                                <span className="font-bold text-white flex items-center gap-2">
                                    <img src={match.teams.home.logo} className="w-4 h-4" alt="" />
                                    {match.teams.home.name}
                                </span>
                                <span className="font-bold text-white flex items-center gap-2">
                                    <img src={match.teams.away.logo} className="w-4 h-4" alt="" />
                                    {match.teams.away.name}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center w-1/3">
                            {match.fixture.status.short === 'NS' ? (
                                <span className="text-xl font-bold text-muted-foreground">
                                    {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : (
                                <div className="text-2xl font-black text-white tracking-widest bg-black/20 px-4 py-1 rounded-lg border border-white/5">
                                    {match.goals.home ?? 0} - {match.goals.away ?? 0}
                                </div>
                            )}
                            <span className="text-xs text-muted-foreground mt-1">{match.league.name}</span>
                        </div>

                        <div className="w-1/3 text-right">

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
