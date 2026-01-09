import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();

    const scrollToPredictions = () => {
        const element = document.getElementById('predictions');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative overflow-hidden py-20 lg:py-32">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full opacity-20 pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-emerald-400 backdrop-blur-md"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>AI Model Updated: 73.2% Accuracy on Last 50 Games</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
                    >
                        Master the Game with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-green-400">
                            AI-Powered Predictions
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl"
                    >
                        Stop guessing. Our AI engine analyzes millions of data points to find safe, high-probability value bets for you every single day.
                        <span className="block mt-2 text-white/50 text-sm">*Includes H2H Analysis & Manipulation Detection</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 pt-4"
                    >
                        <button
                            onClick={scrollToPredictions}
                            className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            Get Today's Picks <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => navigate('/history')}
                            className="h-12 px-8 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                        >
                            View Success Rate
                        </button>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white">Safe & Secure</h3>
                            <p className="text-sm text-muted-foreground mt-2">We prioritize safety. Our algorithm filters out risky volatile matches.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <TrendingUp className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white">Value Driven</h3>
                            <p className="text-sm text-muted-foreground mt-2">Finding the sweet spot between high probability and decent odds.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <Trophy className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white">Proven Record</h3>
                            <p className="text-sm text-muted-foreground mt-2">Transparent history. We show you the logic behind every pick.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
