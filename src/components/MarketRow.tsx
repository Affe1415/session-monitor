import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { AnimatedClock } from './AnimatedClock';
import type { MarketState } from '../types';

interface MarketRowProps {
  market: MarketState;
  compact: boolean;
  index: number;
}

export function MarketRow({ market, compact, index }: MarketRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{
        y: -2,
        backgroundColor: 'rgba(255,255,255,0.035)',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
      }}
      className={`flex items-center gap-3 px-4 transition-colors ${
        compact ? 'py-2.5' : 'py-3.5'
      } ${market.isOverlapping ? 'bg-blue/5 border-l-2 border-l-blue/50' : ''}`}
    >
      <span className={`${compact ? 'text-base' : 'text-lg'}`}>{market.flag}</span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-text">{market.name}</span>
          <span className="text-[11px] text-text-secondary">{market.exchange}</span>
        </div>
        <span className="text-[10px] text-text-secondary">{market.timezoneLabel}</span>
      </div>

      <div className="text-right">
        <p className={`font-mono font-medium text-text ${compact ? 'text-xs' : 'text-sm'}`}>
          <AnimatedClock value={market.localTime} />
        </p>
        <div className="mt-1 flex justify-end">
          <StatusBadge status={market.status} size="sm" />
        </div>
      </div>
    </motion.div>
  );
}
