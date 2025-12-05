import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'glass', children, ...props }, ref) => {
        const variants = {
            default: "bg-slate-900 border border-slate-800",
            glass: "bg-white/5 backdrop-blur-xl border border-white/10",
            outline: "border border-slate-800 bg-transparent",
        };

        return (
            <div
                ref={ref}
                className={`rounded-3xl p-6 ${variants[variant]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
