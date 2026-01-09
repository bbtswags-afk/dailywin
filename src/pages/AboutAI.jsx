import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Database, Search, ShieldCheck, Target, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutAI = () => {
    return (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 mb-20 max-w-3xl mx-auto"
            >
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
                    <Brain className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Democratizing Sports Data with <span className="text-primary">Artificial Intelligence</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    DailyWin AI bridges the gap between raw statistics and actionable insights. We process millions of data points to provide transparent, data-driven football analysis.
                </p>
            </motion.div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        In a world of subjective sports opinions, our mission is to provide <strong>objective, mathematical analysis</strong>.
                        We believe that sports fans deserve access to the same level of sophisticated data analysis that professional analysts use.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Our platform leverages Google's Gemini AI and extensive historical datasets to identify patterns that are often invisible to the human eye.
                        We don't just guess; we calculate.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        Who We Are
                    </h3>
                    <ul className="space-y-4 text-muted-foreground">
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5" />
                            <span>A team of data scientists and football enthusiasts.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5" />
                            <span>Experts in machine learning and predictive modeling.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5" />
                            <span>Committed to transparency and responsible implementation of AI.</span>
                        </li>
                    </ul>
                </motion.div>
            </div>

            {/* How It Works */}
            <div className="mb-24">
                <h2 className="text-3xl font-bold text-white text-center mb-12">The Technology Stack</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                        <Database className="w-10 h-10 text-blue-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">1. Data Aggregation</h3>
                        <p className="text-sm text-muted-foreground">
                            We ingest real-time data from premium APIs, covering 500+ leagues. This includes Head-to-Head records, recent team form, player availability, and even referee tendencies.
                        </p>
                    </div>
                    <div className="bg-card border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                        <Cpu className="w-10 h-10 text-emerald-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">2. AI Processing</h3>
                        <p className="text-sm text-muted-foreground">
                            Our proprietary heuristic models, powered by rigorous LLMs, analyze the data. The AI looks for statistical anomalies and potential outcomes based on historical precedence.
                        </p>
                    </div>
                    <div className="bg-card border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                        <Search className="w-10 h-10 text-purple-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">3. Value Identification</h3>
                        <p className="text-sm text-muted-foreground">
                            The system outputs a probability score for various markets (Goals, Corners, Results). We compare this against market odds to identify "Value" — where the probability exceeds the implied odds.
                        </p>
                    </div>
                </div>
            </div>

            {/* Transparency & Disclaimer - Critical for AdSense */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 mb-16">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Responsible Usage & Disclaimer</h3>
                        <p className="text-muted-foreground mb-4">
                            <strong>DailyWin AI is an informational tool, not a gambling operator.</strong> We do not accept bets, handle payments for wagers, or facilitate any form of online gambling.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Predictions are based on statistics and does not guarantee results.</li>
                                <li>The element of chance is always present in sports.</li>
                                <li>Past performance of our AI is not indicative of future results.</li>
                            </ul>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Users must be 18+ to use this service.</li>
                                <li>Always comply with local laws in your jurisdiction regarding sports betting.</li>
                                <li>If you or someone you know has a gambling problem, please seek help.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-gradient-to-br from-primary/10 to-transparent rounded-3xl p-12 border border-primary/20">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to see the data?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Join our community of smart sports fans who value data over intuition.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup" className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity">
                        Create Free Account
                    </Link>
                    <Link to="/live" className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                        View Live Scores
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutAI;
