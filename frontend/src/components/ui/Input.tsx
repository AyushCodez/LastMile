import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, leftIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${leftIcon ? 'pl-11' : ''}
                            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'hover:border-white/20'}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs text-rose-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
