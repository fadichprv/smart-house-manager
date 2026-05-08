import React from 'react';
import { clsx } from 'clsx';

interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; }

const Card: React.FC<CardProps> = ({ children, className, hover }) => (
  <div className={clsx(
    'bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-2xl p-5',
    hover && 'hover:border-violet-500/30 hover:bg-slate-800 transition-all duration-200',
    className
  )}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={clsx('mb-4', className)}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-base font-semibold text-white">{children}</h3>
);

export default Card;
