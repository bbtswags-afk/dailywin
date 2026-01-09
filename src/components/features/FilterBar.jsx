import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const categories = [
    { id: 'all', label: 'All Predictions' },
    { id: 'safe', label: 'Safe Bets (Avg 90%)' },
    { id: 'goals', label: 'Over 1.5 / 2.5' },
    { id: 'win', label: 'Straight Wins' },
    { id: 'corners', label: 'Corners' },
    { id: 'double', label: 'Double Chance' },
];

const FilterBar = ({ activeCategory, onSelect }) => {
    return (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelect(category.id)}
                    className={cn(
                        "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        activeCategory === category.id
                            ? "text-primary-foreground bg-primary shadow-glow-primary hover:opacity-90"
                            : "text-muted-foreground bg-secondary/50 hover:bg-secondary hover:text-white"
                    )}
                >
                    {category.label}
                    {activeCategory === category.id && (
                        <motion.div
                            layoutId="activeFilter"
                            className="absolute inset-0 rounded-full border-2 border-primary/20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
