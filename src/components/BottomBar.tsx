import { motion } from 'framer-motion';
import { RotateCw, Sun, Settings, Clock } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { AnimatedClock } from './AnimatedClock';

interface BottomBarProps {
  overlapMarkets: [string, string];
  overlapSeconds: number;
  nextOpenMarket?: string;
  nextOpenSeconds?: number;
  onOpenSettings: () => void;
  updateVersion?: string | null;
  onInstallUpdate?: () => void;
  accentColor: string;
}

export function BottomBar({
  overlapMarkets,
  overlapSeconds,
  nextOpenMarket,
  nextOpenSeconds,
  onOpenSettings,
  updateVersion,
  onInstallUpdate,
  accentColor,
}: BottomBarProps) {
  const overlap = useCountdown(overlapSeconds);
  const nextOpen = useCountdown(nextOpenSeconds ?? 0);

  return (
    <footer className="mt-auto border-t border-white/[0.08] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Sun className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
            <span className="truncate text-[11px]">
              Next Session Overlap:{' '}
              <span className="text-text font-medium">
                {overlapMarkets[0]} / {overlapMarkets[1]}
              </span>
            </span>
          </div>
          <p className="mt-0.5 font-mono text-lg font-bold text-text">
            <AnimatedClock value={overlap.formatted} />
          </p>
          {nextOpenMarket && nextOpenSeconds !== undefined && nextOpenSeconds > 0 && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-text-secondary">
              <Clock className="h-3 w-3" />
              <span>
                {nextOpenMarket} opens in{' '}
                <span className="font-mono text-text">
                  <AnimatedClock value={nextOpen.formatted} />
                </span>
              </span>
            </div>
          )}
        </div>

        {updateVersion && (
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: 'rgba(78,161,255,0.14)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onInstallUpdate}
            className="no-drag flex shrink-0 items-center gap-1.5 rounded-lg border border-blue/30 px-2.5 py-2 text-[10px] font-semibold uppercase text-blue"
            title={`Restart and install Session Monitor ${updateVersion}`}
          >
            <RotateCw className="h-3.5 w-3.5" />
            Update
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenSettings}
          className="no-drag flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-text-secondary transition-colors hover:text-text"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </motion.button>
      </div>
    </footer>
  );
}
