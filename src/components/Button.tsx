import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'neon';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "rounded-lg font-bold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };

    const variants = {
        primary: "bg-green-600 text-white hover:bg-green-700",
        secondary: "bg-zinc-800 text-white hover:bg-zinc-900 border border-zinc-700",
        outline: "border-2 border-green-600 text-green-600 hover:bg-green-50/10",
        danger: "bg-red-600 text-white hover:bg-red-700",
        neon: "bg-[#ccff00] text-black hover:bg-[#b8e600] shadow-[0_0_15px_-3px_rgba(204,255,0,0.5)] hover:shadow-[0_0_20px_-3px_rgba(204,255,0,0.6)]",
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children}
        </button>
    );
};
