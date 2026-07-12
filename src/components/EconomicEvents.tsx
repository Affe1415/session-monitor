import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import type { EconomicEvent } from '../types';

interface EconomicEventsProps {
  events: EconomicEvent[];
  accentColor: string;
}

const impactColors = {
  high: 'text-red bg-red/15 border-red/30',
  medium: 'text-orange bg-orange/15 border-orange/30',
  low: 'text-text-secondary bg-white/5 border-white/10',
};

export function EconomicEvents({ events, accentColor }: EconomicEventsProps) {
  if (events.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mx-4 mt-3 overflow-hidden rounded-2xl glass-card"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2.5">
        <TrendingUp className="h-3.5 w-3.5" style={{ color: accentColor }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
          Today&apos;s Economic Events
        </span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text">{event.title}</p>
              <p className="text-[10px] text-text-secondary">{event.currency}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] text-text-secondary">{event.time}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${impactColors[event.impact]}`}
              >
                {event.impact}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
