import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, CheckCircle, TrendingUp, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

// import PaymentModal from '../components/payment/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api/client';

const Premium = () => {
    const { user } = useAuth();
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);

    const handleUpgrade = async () => {
        try {
            await api.auth.upgrade();
            alert("Upgrade Successful! Welcome to the Winners Circle.");
            window.location.reload();
        } catch (error) {
            console.error("Upgrade failed", error);
            alert("Upgrade failed. Please try again.");
        }
    };

    const benefits = [
        {
            icon: <Star className="w-5 h-5 text-yellow-400" />,
            title: "High Probability Picks",
            desc: "Access exclusive predictions with 85%+ AI confidence scores."
        },
        {
            icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
            title: "Full Match Analysis",
            desc: "See the exact logic, stats, and data behind every prediction."
        },
        {
            icon: <Zap className="w-5 h-5 text-blue-400" />,
            title: "Early Access",
            desc: "Get predictions 24 hours before kick-off to secure the best odds."
        },
        {
            icon: <Shield className="w-5 h-5 text-purple-400" />,
            title: "Risk Management",
            desc: "AI-powered volatility warnings to help you avoid risky bets."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-20 min-h-[80vh] flex flex-col items-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mb-8"
            >
                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
                <div className="relative p-6 bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-full">
                    <Crown className="w-16 h-16 text-yellow-400" />
                </div>
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-white mb-6 text-center"
            >
                Start Winning with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    Premium Access
                </span>
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl text-center mb-12"
            >
                Stop relying on luck. Join the top 1% of users who use our advanced AI models to find high-value, winning opportunities every single day.
            </motion.p>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12"
            >
                {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/5">
                            {benefit.icon}
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                            <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-4 w-full max-w-sm"
            >
                {!user ? (
                    <>
                        <Link
                            to="/login"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] shadow-lg shadow-yellow-500/20"
                        >
                            <Crown className="w-5 h-5" />
                            Login to Subscribe
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Already have an account? <Link to="/login" className="text-yellow-400 hover:underline">Log in</Link>
                        </p>
                    </>
                ) : user.plan === 'premium' ? (
                    <div className="w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-lg flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        You are a Premium Member
                    </div>
                ) : (
                    <>
                        <Link
                            to="/upgrade"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] shadow-lg shadow-yellow-500/20"
                        >
                            <Zap className="w-5 h-5" />
                            Subscribe Now - ₦5,000/mo
                        </Link>
                        <p className="text-xs text-muted-foreground text-center">
                            Secure Bank Transfer via Moniepoint.
                        </p>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default Premium;
