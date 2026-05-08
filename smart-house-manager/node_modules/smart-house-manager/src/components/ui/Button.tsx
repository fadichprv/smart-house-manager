import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', isLoading, leftIcon,
  fullWidth, children, className, disabled, ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50',
        {
          'bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/20': variant === 'primary',
          'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600': variant === 'secondary',
          'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30': variant === 'danger',
          'text-slate-400 hover:text-white hover:bg-slate-700/50': variant === 'ghost',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled || isLoading,
        },
        className
      )}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  );
};

export default Button;
