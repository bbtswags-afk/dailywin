import React from 'react';
import { X, Check } from 'lucide-react';

const PaymentModal = ({ onClose, onUpgrade }) => {
    const handleUpgrade = () => {
        // Simulate API call/Payment processing
        setTimeout(() => {
            onUpgrade();
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                        <span className="text-3xl">👑</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h2>
                    <p className="text-gray-400 mb-8">
                        Unlock full access to all predictions, detailed analysis, confidence scores, and more!
                    </p>

                    <div className="space-y-4 mb-8 text-left">
                        <Benefit text="Unlimited Access to All Predictions" />
                        <Benefit text="Detailed AI Reasoning & Analysis" />
                        <Benefit text="Confidence Scores & Volatility Checks" />
                        <Benefit text="Priority Support" />
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-blue-600/20"
                    >
                        Success Guarantee £29.99/mo (Mock)
                    </button>
                    <p className="mt-4 text-xs text-gray-500">
                        Secure payment processing. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
};

const Benefit = ({ text }) => (
    <div className="flex items-center text-gray-300">
        <div className="flex-shrink-0 mr-3 text-green-400">
            <Check size={20} />
        </div>
        <span className="text-sm">{text}</span>
    </div>
);

export default PaymentModal;
