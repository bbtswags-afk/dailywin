import React from 'react';
import { ShieldCheck, TrendingUp, Zap, Award } from 'lucide-react';

const FeaturesSection = () => {
    return (
        <section className="py-12 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 sm:text-4xl">
                        Why Choose DailyWin AI?
                    </h2>
                    <p className="mt-4 text-xl text-gray-400">
                        Unlock the power of advanced AI algorithms for your sports predictions.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <FeatureCard
                        icon={<TrendingUp className="h-8 w-8 text-green-400" />}
                        title="High Accuracy"
                        description="Our AI models are trained on years of historical data to provide the most accurate predictions."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="h-8 w-8 text-blue-400" />}
                        title="Risk Management"
                        description="We analyze volatility to help you make safer, smarter betting decisions."
                    />
                    <FeatureCard
                        icon={<Zap className="h-8 w-8 text-yellow-400" />}
                        title="Real-Time Analysis"
                        description="Get up-to-the-minute insights and analysis for every match."
                    />
                    <FeatureCard
                        icon={<Award className="h-8 w-8 text-purple-400" />}
                        title="Premium Insights"
                        description="Unlock detailed reasoning and confidence scores with our Premium plan."
                    />
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-700 mb-4 mx-auto">
            {icon}
        </div>
        <h3 className="text-lg font-medium text-white text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-center text-sm">{description}</p>
    </div>
);

export default FeaturesSection;
