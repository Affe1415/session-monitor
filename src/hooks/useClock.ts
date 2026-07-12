import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

export function useClock(showSeconds: boolean): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = showSeconds ? 1000 : 60000;
    const id = window.setInterval(() => setNow(new Date()), interval);
    return () => window.clearInterval(id);
  }, [showSeconds]);

  return now;
}

export function useUtcNow(showSeconds: boolean): DateTime {
  const [now, setNow] = useState(() => DateTime.utc());

  useEffect(() => {
    const interval = showSeconds ? 1000 : 60000;
    const id = window.setInterval(() => setNow(DateTime.utc()), interval);
    return () => window.clearInterval(id);
  }, [showSeconds]);

  return now;
}
