import { motion, useReducedMotion } from 'framer-motion';

export function LiveIndicator() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <motion.span
          className="absolute inset-0 rounded-full bg-green"
          animate={reduceMotion ? { opacity: 0.22 } : { scale: [1, 2.25], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-green">
        Live
      </span>
    </div>
  );
}
