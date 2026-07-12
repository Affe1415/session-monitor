import { useEffect, useState } from 'react';
import { formatCountdown } from '../utils/formatTime';

export function useCountdown(initialSeconds: number): {
  seconds: number;
  formatted: string;
} {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [seconds]);

  return {
    seconds,
    formatted: formatCountdown(seconds),
  };
}
