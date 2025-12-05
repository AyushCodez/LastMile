import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, options, children, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white appearance-none
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'hover:border-white/20'}
                            ${className}
                        `}
                        {...props}
                    >
                        {children}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-1 text-xs text-rose-400">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
