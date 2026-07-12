import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { AnimatedClock } from './AnimatedClock';
import type { MarketState } from '../types';
import type { AppSettings } from '../types';

interface CurrentSessionCardProps {
  session: MarketState;
  settings: AppSettings;
}

export function CurrentSessionCard({ session, settings }: CurrentSessionCardProps) {
  const isLunch = session.status === 'LUNCH BREAK';
  const isActive = session.status === 'OPEN' || isLunch;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        boxShadow: '0 12px 38px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="mx-4 mt-4 rounded-2xl glass-card p-4 shadow-window"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
          Current Session
        </span>
        {isActive && (
          <StatusBadge status="ACTIVE" size="sm" glow />
        )}
        {!isActive && (
          <StatusBadge status={session.status} size="sm" />
        )}
      </div>

      <div className="mb-4">
        <motion.h2
          key={session.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-text"
        >
          {session.name}{' '}
          <span className="text-text-secondary font-medium text-lg">
            ({session.exchange})
          </span>
        </motion.h2>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
            Time in {session.name}
          </p>
          <p
            className={`font-mono font-bold text-text ${
              settings.compactMode ? 'text-2xl' : 'text-3xl'
            }`}
          >
            <AnimatedClock value={session.localTime} />
          </p>
          <p className="mt-1 text-xs text-text-secondary">{session.timezoneLabel}</p>
        </div>

        <div className="flex-1 border-l border-white/[0.08] pl-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
            Market Status
          </p>
          {isLunch ? (
            <div className="space-y-1">
              <StatusBadge
                status="LUNCH BREAK"
                size="lg"
                glow
                icon="🍴"
              />
              {session.statusDetail && (
                <p className="text-xs text-text-secondary">{session.statusDetail}</p>
              )}
            </div>
          ) : (
            <StatusBadge status={session.status} size="lg" glow={session.status === 'OPEN'} />
          )}
        </div>
      </div>
    </motion.section>
  );
}
