import { motion } from 'framer-motion';
import { MarketRow } from './MarketRow';
import type { MarketState } from '../types';

interface MarketsListProps {
  markets: MarketState[];
  compact: boolean;
}

export function MarketsList({ markets, compact }: MarketsListProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{
        y: -2,
        boxShadow: '0 12px 38px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }}
      transition={{ delay: 0.15, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="mx-4 mt-3 overflow-hidden rounded-2xl glass-card"
    >
      <div className="border-b border-white/[0.08] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
          Global Markets
        </span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {markets.map((market, index) => (
          <MarketRow
            key={market.id}
            market={market}
            compact={compact}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  );
}
