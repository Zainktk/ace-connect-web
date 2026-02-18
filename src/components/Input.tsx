import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 focus:border-[#ccff00]/50 transition-all placeholder:text-zinc-600
          ${error ? 'border-red-500' : 'border-zinc-800'}
          ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};
