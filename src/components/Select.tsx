import React, { type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
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
            <div className="relative">
                <select
                    id={id}
                    className={`w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-50 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 focus:border-[#ccff00]/50 transition-all
            ${error ? 'border-red-500' : 'border-zinc-800'}
            ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-900 text-zinc-50">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};
