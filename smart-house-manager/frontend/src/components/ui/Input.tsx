import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, leftIcon, rightIcon, className, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{leftIcon}</div>
      )}
      <input
        {...props}
        className={clsx(
          'w-full bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all',
          'py-2.5 text-sm',
          leftIcon ? 'pl-10' : 'pl-4',
          rightIcon ? 'pr-10' : 'pr-4',
          error && 'border-red-500/50',
          className
        )}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{rightIcon}</div>
      )}
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
    <textarea
      {...props}
      className={clsx(
        'w-full bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all',
        'px-4 py-2.5 text-sm resize-none',
        className
      )}
    />
  </div>
);

export default Input;
