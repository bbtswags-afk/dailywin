import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full bg-[#0a0f1c] border-t border-white/10 py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="h-8 w-8 opacity-80" />
                            <span className="text-xl font-bold text-white">Dailywin.AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Smart AI-powered sports predictions helping you find value every day.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/" className="hover:text-emerald-400">Predictions</Link></li>
                            <li><Link to="/premium" className="hover:text-emerald-400">Premium</Link></li>
                            <li><Link to="/live" className="hover:text-emerald-400">Live Scores</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/terms" className="hover:text-emerald-400">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="hover:text-emerald-400">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/contact" className="hover:text-emerald-400">Contact Us</Link></li>
                            <li><a href="mailto:admin@dailywin.space" className="hover:text-emerald-400">admin@dailywin.space</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Dailywin AI. All rights reserved. Not a gambling site.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
