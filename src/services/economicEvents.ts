import { DateTime } from 'luxon';
import type { EconomicEvent } from '../types';

const WEEKLY_EVENTS: Omit<EconomicEvent, 'time'>[] = [
  {
    id: 'nfp',
    title: 'Non-Farm Payrolls',
    impact: 'high',
    currency: 'USD',
  },
  {
    id: 'cpi',
    title: 'Consumer Price Index',
    impact: 'high',
    currency: 'USD',
  },
  {
    id: 'fomc',
    title: 'FOMC Rate Decision',
    impact: 'high',
    currency: 'USD',
  },
  {
    id: 'gdp',
    title: 'GDP Growth Rate',
    impact: 'medium',
    currency: 'USD',
  },
  {
    id: 'pmi',
    title: 'Manufacturing PMI',
    impact: 'medium',
    currency: 'EUR',
  },
  {
    id: 'boe',
    title: 'BoE Interest Rate',
    impact: 'high',
    currency: 'GBP',
  },
  {
    id: 'ecb',
    title: 'ECB Press Conference',
    impact: 'high',
    currency: 'EUR',
  },
  {
    id: 'retail',
    title: 'Retail Sales',
    impact: 'medium',
    currency: 'USD',
  },
];

const EVENT_SCHEDULE: Record<number, { hour: number; minute: number; eventIndex: number }[]> = {
  1: [{ hour: 8, minute: 30, eventIndex: 3 }],
  2: [{ hour: 10, minute: 0, eventIndex: 4 }],
  3: [{ hour: 14, minute: 0, eventIndex: 5 }],
  4: [{ hour: 8, minute: 30, eventIndex: 7 }],
  5: [{ hour: 8, minute: 30, eventIndex: 0 }],
};

export function getTodaysEconomicEvents(
  use24Hour: boolean,
  nowUtc: DateTime = DateTime.utc()
): EconomicEvent[] {
  const nyNow = nowUtc.setZone('America/New_York');
  const weekday = nyNow.weekday;

  if (weekday === 6 || weekday === 7) {
    return [];
  }

  const schedule = EVENT_SCHEDULE[weekday] ?? [
    { hour: 8, minute: 30, eventIndex: 1 },
    { hour: 10, minute: 0, eventIndex: 4 },
  ];

  return schedule
    .map(({ hour, minute, eventIndex }) => {
      const template = WEEKLY_EVENTS[eventIndex % WEEKLY_EVENTS.length];
      const eventTime = nyNow.set({ hour, minute, second: 0, millisecond: 0 });
      const timeFormat = use24Hour ? 'HH:mm' : 'h:mm a';

      return {
        ...template,
        id: `${template.id}-${nyNow.toISODate()}`,
        time: `${eventTime.toFormat(timeFormat)} ET`,
      };
    })
    .filter((event) => {
      const eventHour = parseInt(event.time.split(':')[0], 10);
      return eventHour >= nyNow.hour - 1;
    })
    .slice(0, 4);
}
