import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';

interface AnimatedDigitProps {
  value: string;
  className?: string;
}

const digitMotion = {
  initial: { y: 8, opacity: 0, filter: 'blur(2px)' },
  animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { y: -8, opacity: 0, filter: 'blur(2px)' },
};

const reducedDigitMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const AnimatedDigit = memo(function AnimatedDigit({
  value,
  className = '',
}: AnimatedDigitProps) {
  const reduceMotion = useReducedMotion();
  const isDigit = /\d/.test(value);
  const variants = reduceMotion ? reducedDigitMotion : digitMotion;

  if (!isDigit) {
    return (
      <span className={`inline-block whitespace-pre ${className}`}>
        {value}
      </span>
    );
  }

  return (
    <span
      className={`relative inline-block overflow-hidden align-baseline ${className}`}
      style={{ width: '0.62em', fontVariantNumeric: 'tabular-nums' }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

interface AnimatedClockProps {
  value: string;
  className?: string;
  digitClassName?: string;
  ariaLabel?: string;
}

export const AnimatedClock = memo(function AnimatedClock({
  value,
  className = '',
  digitClassName = '',
  ariaLabel,
}: AnimatedClockProps) {
  return (
    <span
      className={`inline-flex items-baseline whitespace-pre ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      aria-label={ariaLabel ?? value}
    >
      {Array.from(value).map((char, index) => (
        <AnimatedDigit
          key={`${index}-${/\d/.test(char) ? 'digit' : char}`}
          value={char}
          className={digitClassName}
        />
      ))}
    </span>
  );
});
