import React from 'react';
import { Crown, Lock } from 'lucide-react';

interface ProBadgeProps {
  variant?: 'pill' | 'mini' | 'lock' | 'crown';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const ProBadge: React.FC<ProBadgeProps> = ({
  variant = 'pill',
  className = '',
  onClick
}) => {
  if (variant === 'mini') {
    return (
      <span 
        onClick={onClick}
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] font-black tracking-wider uppercase shadow-2xs cursor-pointer select-none ${className}`}
        title="Funzionalità esclusiva MyGarage360 PRO"
      >
        <Crown className="w-2.5 h-2.5 fill-slate-950" />
        <span>PRO</span>
      </span>
    );
  }

  if (variant === 'lock') {
    return (
      <span 
        onClick={onClick}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 border border-amber-300 text-[10px] font-extrabold uppercase shadow-2xs cursor-pointer select-none ${className}`}
        title="Funzionalità riservata a MyGarage360 PRO"
      >
        <Lock className="w-2.5 h-2.5" />
        <span>PRO</span>
      </span>
    );
  }

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-xs cursor-pointer select-none hover:brightness-105 active:scale-95 transition-all ${className}`}
      title="Sblocca con MyGarage360 PRO"
    >
      <Crown className="w-3 h-3 fill-slate-950" />
      <span>PRO</span>
    </span>
  );
};
