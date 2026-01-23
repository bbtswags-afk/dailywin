import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { Check, Mail, Copy, CheckCircle, ArrowRight, Smartphone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api/client';

const Upgrade = () => {
    const [copied, setCopied] = useState('');
    const [loading, setLoading] = useState(false);
    const [claimStatus, setClaimStatus] = useState('idle'); // idle, pending, success

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    const handleClaim = async () => {
        setLoading(true);
        try {
            await api.payment.claim();
            setClaimStatus('success');
        } catch (error) {
            console.error("Claim failed", error);
            alert("Failed to notify admin. Please email us directly.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white font-sans selection:bg-blue-500/30">
            <Header />

            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-white to-blue-200 bg-clip-text text-transparent">
                        Unlock Premium Access
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Get 85%+ win rate predictions, detailed AI analysis, and join the top 1% of sports bettors.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Instructions & Benefits */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-xs text-white">1</span>
                                How to Upgrade
                            </h2>
                            <ol className="space-y-6 relative border-l border-white/10 ml-3 pl-8">
                                <li className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    </span>
                                    <h3 className="font-bold text-white mb-1">Make a Transfer</h3>
                                    <p className="text-gray-400 text-sm">Transfer ₦5,000 to the Moniepoint account details provided.</p>
                                </li>
                                <li className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    </span>
                                    <h3 className="font-bold text-white mb-1">Take a Screenshot</h3>
                                    <p className="text-gray-400 text-sm">Capture the success receipt of your transaction.</p>
                                </li>
                                <li className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    </span>
                                    <h3 className="font-bold text-white mb-1">Send Proof via WhatsApp</h3>
                                    <p className="text-gray-400 text-sm mb-3">Send the screenshot to our official WhatsApp line:</p>
                                    <a
                                        href="https://wa.me/2348052478055"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-[#25D366]/20 rounded-lg border border-[#25D366]/30 hover:bg-[#25D366]/30 transition-colors w-full group"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        <span className="font-mono text-sm text-[#25D366] font-bold">Chat on WhatsApp</span>
                                        <ArrowRight className="w-3 h-3 text-[#25D366] ml-auto group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </li>
                                <li className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    </span>
                                    <h3 className="font-bold text-white mb-1">Confirm Payment</h3>
                                    <p className="text-gray-400 text-sm">Click "I Have Sent The Money" to notify us instantly.</p>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/10 rounded-2xl p-6">
                            <h3 className="font-bold text-blue-200 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Why Premium?
                            </h3>
                            <ul className="grid grid-cols-1 gap-2">
                                {['Daily 85%+ Accuracy Predictions', 'Full Match Analysis & Stats', 'Risk Management Tools', 'Priority WhatsApp Support'].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                        <CheckCircle className="w-3 h-3 text-blue-500" /> {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Payment Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white text-black rounded-3xl p-1 shadow-2xl shadow-blue-900/20"
                    >
                        <div className="bg-gray-50 rounded-[20px] p-8 border border-gray-200 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Amount</p>
                                    <h2 className="text-4xl font-black text-gray-900">₦5,000</h2>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                                    M
                                </div>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <div className="w-20 h-20 bg-blue-600 rounded-full blur-2xl"></div>
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Bank Name</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm bg-[#035B96]"></div>
                                        <span className="text-xl font-bold text-gray-800">Moniepoint MFB</span>
                                    </div>
                                </div>

                                <div className="bg-blue-600 p-5 rounded-xl border border-blue-500 shadow-lg relative overflow-hidden group cursor-pointer"
                                    onClick={() => handleCopy('8026150375', 'account')}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <p className="text-xs text-blue-100 uppercase tracking-wide font-bold">Account Number</p>
                                        {copied === 'account' ? (
                                            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded flex items-center gap-1 font-bold">Copied <Check className="w-3 h-3" /></span>
                                        ) : (
                                            <Copy className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors" />
                                        )}
                                    </div>
                                    <div className="text-3xl font-mono font-bold text-white tracking-wider flex items-center gap-3 relative z-10">
                                        8026 150 375
                                    </div>
                                    <p className="text-blue-200 text-xs mt-2 relative z-10">Tap to copy</p>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Account Name</p>
                                    <span className="text-xl font-bold text-gray-800">Pius Festus</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                {claimStatus === 'success' ? (
                                    <div className="w-full py-4 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-200">
                                        <CheckCircle className="w-5 h-5" />
                                        Admin Notified! Verify pending.
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleClaim}
                                        disabled={loading}
                                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? 'Sending...' : 'I Have Sent The Money'}
                                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                )}
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    Verification typically takes 10-30 minutes.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Upgrade;
