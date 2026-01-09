import React from 'react';
import { Trophy, ArrowUpRight } from 'lucide-react';

const RecentWins = () => {
    const wins = [
        { team: "Real Madrid vs Napoli", result: "Over 2.5 Goals", odds: "1.85", status: "WON" },
        { team: "Man City vs Chelsea", result: "Home Win", odds: "1.55", status: "WON" },
        { team: "Inter vs Juventus", result: "Under 3.5 Goals", odds: "1.40", status: "WON" },
        { team: "Bayern vs Mainz", result: "HT/FT 1/1", odds: "1.90", status: "WON" },
    ];

    return (
        <section className="py-8 border-y border-white/5 bg-white/5">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">Recent Big Wins</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {wins.map((win, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-background border border-white/10 flex flex-col gap-2">
                            <div className="text-xs text-muted-foreground">{win.team}</div>
                            <div className="font-bold text-emerald-400 flex items-center gap-1">
                                {win.result}
                                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">@{win.odds}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Confirmed
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentWins;
