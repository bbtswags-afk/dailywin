import React, { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="relative overflow-hidden rounded-3xl bg-secondary/20 border border-white/5 p-8 md:p-12 text-center max-w-4xl mx-auto">
            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto space-y-6">
                <div className="h-16 w-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8" />
                </div>

                <h2 className="text-3xl font-bold text-white">Don't Miss a Winning Bet</h2>
                <p className="text-muted-foreground">
                    Subscribe to get our top 3 "High Confidence" predictions sent directly to your inbox every morning. Free forever.
                </p>

                {status === 'success' ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-6 py-4 rounded-xl border border-emerald-500/20 animate-in fade-in zoom-in">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Successfully Subscribed! check your inbox.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1 h-12 rounded-xl bg-background/50 border border-white/10 px-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px]"
                        >
                            {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Subscribe'}
                        </button>
                    </form>
                )}

                <p className="text-xs text-muted-foreground/50">
                    No spam. Unsubscribe at any time.
                </p>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        </section>
    );
};

export default Newsletter;
