import { DateTime } from 'luxon';
import { MARKETS } from './marketHours';

function parseTimeOnDate(date: DateTime, time: string): DateTime {
  const [hour, minute] = time.split(':').map(Number);
  return date.set({ hour, minute, second: 0, millisecond: 0 });
}

function isWeekend(date: DateTime): boolean {
  return date.weekday === 6 || date.weekday === 7;
}

export function getNextSessionOverlap(nowUtc: DateTime = DateTime.utc()): {
  markets: [string, string];
  startsAt: string;
  countdownSeconds: number;
} | null {
  const london = MARKETS.london;
  const newYork = MARKETS.newyork;

  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const nyDate = nowUtc.setZone(newYork.timezone).plus({ days: dayOffset }).startOf('day');
    if (isWeekend(nyDate)) continue;

    const londonDate = nyDate.setZone(london.timezone).startOf('day');
    const londonOpen = parseTimeOnDate(londonDate, london.sessions[0].open);
    const londonClose = parseTimeOnDate(londonDate, london.sessions[0].close);
    const nyOpen = parseTimeOnDate(nyDate, newYork.sessions[0].open);
    const nyClose = parseTimeOnDate(nyDate, newYork.sessions[0].close);

    const overlapStart = nyOpen > londonOpen ? nyOpen : londonOpen;
    const overlapEnd = londonClose < nyClose ? londonClose : nyClose;

    if (overlapStart >= overlapEnd) continue;

    const overlapStartUtc = overlapStart.toUTC();
    const overlapEndUtc = overlapEnd.toUTC();
    const now = nowUtc;

    if (now >= overlapEndUtc) continue;
    if (now >= overlapStartUtc && now < overlapEndUtc) continue;

    const diff = overlapStartUtc.diff(now, 'seconds').seconds;
    return {
      markets: ['London', 'New York'],
      startsAt: overlapStartUtc.toISO() ?? '',
      countdownSeconds: Math.max(0, Math.floor(diff)),
    };
  }

  return null;
}

export function getOverlappingMarketIds(nowUtc: DateTime = DateTime.utc()): string[] {
  const london = MARKETS.london;
  const newYork = MARKETS.newyork;
  const nyNow = nowUtc.setZone(newYork.timezone);

  if (isWeekend(nyNow)) return [];

  const londonDate = nyNow.setZone(london.timezone).startOf('day');
  const nyDate = nyNow.startOf('day');

  const londonOpen = parseTimeOnDate(londonDate, london.sessions[0].open);
  const londonClose = parseTimeOnDate(londonDate, london.sessions[0].close);
  const nyOpen = parseTimeOnDate(nyDate, newYork.sessions[0].open);
  const nyClose = parseTimeOnDate(nyDate, newYork.sessions[0].close);

  const now = nowUtc;
  const londonActive = now >= londonOpen.toUTC() && now < londonClose.toUTC();
  const nyActive = now >= nyOpen.toUTC() && now < nyClose.toUTC();

  if (londonActive && nyActive) {
    return ['london', 'newyork'];
  }

  return [];
}
