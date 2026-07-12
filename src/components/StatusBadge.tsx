import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getStatusColorClass, getStatusGlowClass } from '../utils/formatTime';
import type { MarketStatus } from '../types';

type DisplayStatus = MarketStatus | 'ACTIVE';

interface StatusBadgeProps {
  status: DisplayStatus;
  detail?: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  icon?: string;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
  lg: 'px-3 py-1.5 text-xs',
};

export function StatusBadge({
  status,
  detail,
  size = 'md',
  glow = false,
  icon,
}: StatusBadgeProps) {
  const reduceMotion = useReducedMotion();
  const colorClass = getStatusColorClass(status);
  const glowClass = glow ? getStatusGlowClass(status) : '';

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={status}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={
          reduceMotion
            ? { opacity: 1 }
            : {
                opacity: 1,
                scale: 1,
                boxShadow: glow
                  ? ['0 0 0 rgba(46, 204, 113, 0)', '0 0 16px rgba(46, 204, 113, 0.4)', '0 0 0 rgba(46, 204, 113, 0)']
                  : undefined,
              }
        }
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wide ${sizeClasses[size]} ${colorClass} ${glowClass}`}
      >
        {icon && <span className="text-[10px]">{icon}</span>}
        <span>{status}</span>
        {detail && size === 'lg' && (
          <span className="sr-only">{detail}</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
