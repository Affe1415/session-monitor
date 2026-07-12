import { DateTime } from 'luxon';
import type {
  MarketDefinition,
  MarketId,
  MarketState,
  MarketStatus,
} from '../types';
import { getOverlappingMarketIds } from './overlapCalculator';

export { getNextSessionOverlap } from './overlapCalculator';

export const MARKETS: Record<MarketId, MarketDefinition> = {
  sydney: {
    id: 'sydney',
    name: 'Sydney',
    exchange: 'ASX',
    timezone: 'Australia/Sydney',
    countryCode: 'AU',
    flag: '🇦🇺',
    sessions: [{ open: '10:00', close: '16:00' }],
    holidays: [],
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    exchange: 'TSE',
    timezone: 'Asia/Tokyo',
    countryCode: 'JP',
    flag: '🇯🇵',
    sessions: [
      {
        open: '09:00',
        close: '15:00',
        lunchStart: '11:30',
        lunchEnd: '12:30',
      },
    ],
    holidays: [],
  },
  hongkong: {
    id: 'hongkong',
    name: 'Hong Kong',
    exchange: 'HKEX',
    timezone: 'Asia/Hong_Kong',
    countryCode: 'HK',
    flag: '🇭🇰',
    sessions: [
      {
        open: '09:30',
        close: '16:00',
        lunchStart: '12:00',
        lunchEnd: '13:00',
      },
    ],
    holidays: [],
  },
  frankfurt: {
    id: 'frankfurt',
    name: 'Frankfurt',
    exchange: 'XETRA',
    timezone: 'Europe/Berlin',
    countryCode: 'DE',
    flag: '🇩🇪',
    sessions: [{ open: '09:00', close: '17:30' }],
    holidays: [],
  },
  london: {
    id: 'london',
    name: 'London',
    exchange: 'LSE',
    timezone: 'Europe/London',
    countryCode: 'GB',
    flag: '🇬🇧',
    sessions: [{ open: '08:00', close: '16:30' }],
    holidays: [],
  },
  newyork: {
    id: 'newyork',
    name: 'New York',
    exchange: 'NYSE',
    timezone: 'America/New_York',
    countryCode: 'US',
    flag: '🇺🇸',
    sessions: [
      {
        open: '09:30',
        close: '16:00',
        preMarketStart: '04:00',
        afterHoursEnd: '20:00',
        lunchStart: '12:00',
        lunchEnd: '13:00',
      },
    ],
    holidays: [],
  },
  chicago: {
    id: 'chicago',
    name: 'Chicago',
    exchange: 'CME',
    timezone: 'America/Chicago',
    countryCode: 'US',
    flag: '🇺🇸',
    sessions: [
      {
        open: '08:30',
        close: '15:00',
        preMarketStart: '17:00',
        afterHoursEnd: '16:00',
      },
    ],
    holidays: [],
  },
  toronto: {
    id: 'toronto',
    name: 'Toronto',
    exchange: 'TSX',
    timezone: 'America/Toronto',
    countryCode: 'CA',
    flag: '🇨🇦',
    sessions: [{ open: '09:30', close: '16:00' }],
    holidays: [],
  },
};

const US_MARKET_HOLIDAYS_2026 = [
  '2026-01-01',
  '2026-01-19',
  '2026-02-16',
  '2026-04-03',
  '2026-05-25',
  '2026-06-19',
  '2026-07-03',
  '2026-09-07',
  '2026-11-26',
  '2026-12-25',
];

const UK_MARKET_HOLIDAYS_2026 = [
  '2026-01-01',
  '2026-04-03',
  '2026-04-06',
  '2026-05-04',
  '2026-05-25',
  '2026-08-31',
  '2026-12-25',
  '2026-12-28',
];

function parseTimeOnDate(date: DateTime, time: string): DateTime {
  const [hour, minute] = time.split(':').map(Number);
  return date.set({ hour, minute, second: 0, millisecond: 0 });
}

function isWeekend(date: DateTime): boolean {
  return date.weekday === 6 || date.weekday === 7;
}

function isMarketHoliday(market: MarketDefinition, date: DateTime): boolean {
  const dateStr = date.toISODate();
  if (!dateStr) return false;

  if (market.countryCode === 'US') {
    return US_MARKET_HOLIDAYS_2026.includes(dateStr);
  }
  if (market.countryCode === 'GB') {
    return UK_MARKET_HOLIDAYS_2026.includes(dateStr);
  }

  return market.holidays.includes(dateStr);
}

function getTimezoneLabel(now: DateTime): string {
  const offset = now.offset / 60;
  const sign = offset >= 0 ? '+' : '';
  const abbr = now.offsetNameShort ?? now.toFormat('ZZ');
  return `${abbr} (UTC${sign}${offset})`;
}

function getMarketStatus(
  market: MarketDefinition,
  now: DateTime
): { status: MarketStatus; detail?: string } {
  if (isWeekend(now) || isMarketHoliday(market, now)) {
    return { status: 'HOLIDAY' };
  }

  const session = market.sessions[0];
  const open = parseTimeOnDate(now, session.open);
  const close = parseTimeOnDate(now, session.close);

  if (session.lunchStart && session.lunchEnd) {
    const lunchStart = parseTimeOnDate(now, session.lunchStart);
    const lunchEnd = parseTimeOnDate(now, session.lunchEnd);
    if (now >= lunchStart && now < lunchEnd) {
      const startFormatted = lunchStart.toFormat('h:mm a');
      const endFormatted = lunchEnd.toFormat('h:mm a');
      return {
        status: 'LUNCH BREAK',
        detail: `${startFormatted} - ${endFormatted} ${now.offsetNameShort}`,
      };
    }
  }

  if (session.preMarketStart) {
    const preMarketStart = parseTimeOnDate(now, session.preMarketStart);
    if (now >= preMarketStart && now < open) {
      return { status: 'PRE-MARKET' };
    }
  }

  if (now >= open && now < close) {
    return { status: 'OPEN' };
  }

  if (session.afterHoursEnd) {
    const afterHoursEnd = parseTimeOnDate(now, session.afterHoursEnd);
    if (now >= close && now < afterHoursEnd) {
      return { status: 'AFTER HOURS' };
    }
  }

  return { status: 'CLOSED' };
}

function getNextOpenTime(market: MarketDefinition, now: DateTime): DateTime | null {
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const checkDate = now.plus({ days: dayOffset }).startOf('day');
    if (isWeekend(checkDate) || isMarketHoliday(market, checkDate)) continue;

    const session = market.sessions[0];
    const openTime = parseTimeOnDate(checkDate, session.open);

    if (dayOffset === 0 && now >= openTime) {
      const closeTime = parseTimeOnDate(checkDate, session.close);
      if (now < closeTime) continue;
    }

    if (openTime > now) {
      return openTime;
    }
  }
  return null;
}

export function getMarketState(
  marketId: MarketId,
  use24Hour: boolean,
  showSeconds: boolean,
  nowUtc: DateTime = DateTime.utc()
): MarketState {
  const market = MARKETS[marketId];
  const localNow = nowUtc.setZone(market.timezone);
  const { status, detail } = getMarketStatus(market, localNow);

  const timeFormat = use24Hour
    ? showSeconds
      ? 'HH:mm:ss'
      : 'HH:mm'
    : showSeconds
      ? 'h:mm:ss a'
      : 'h:mm a';

  const nextOpen = getNextOpenTime(market, localNow);

  return {
    id: market.id,
    name: market.name,
    exchange: market.exchange,
    timezone: market.timezone,
    countryCode: market.countryCode,
    flag: market.flag,
    localTime: localNow.toFormat(timeFormat),
    timezoneLabel: getTimezoneLabel(localNow),
    status,
    statusDetail: detail,
    isActiveSession: status === 'OPEN' || status === 'LUNCH BREAK',
    nextOpen: nextOpen?.toISO() ?? undefined,
  };
}

export function getAllMarketStates(
  visibleMarkets: MarketId[],
  use24Hour: boolean,
  showSeconds: boolean,
  nowUtc: DateTime = DateTime.utc()
): MarketState[] {
  const states = visibleMarkets.map((id) =>
    getMarketState(id, use24Hour, showSeconds, nowUtc)
  );

  const overlappingIds = getOverlappingMarketIds(nowUtc);
  if (overlappingIds.length > 0) {
    states.forEach((state) => {
      if (overlappingIds.includes(state.id)) {
        state.isOverlapping = true;
      }
    });
  }

  return states;
}

export function getActiveSessionMarket(states: MarketState[]): MarketState | null {
  const priority: MarketStatus[] = ['OPEN', 'LUNCH BREAK', 'PRE-MARKET', 'AFTER HOURS'];
  for (const status of priority) {
    const active = states.filter((s) => s.status === status);
    if (active.length > 0) {
      return active.find((s) => s.id === 'newyork') ?? active[0];
    }
  }
  return states.find((s) => s.id === 'newyork') ?? states[0] ?? null;
}

export function getNextMarketOpenCountdown(
  states: MarketState[],
  nowUtc: DateTime = DateTime.utc()
): { market: string; seconds: number } | null {
  let nearest: { market: string; seconds: number } | null = null;

  for (const state of states) {
    if (state.status === 'OPEN' || state.status === 'LUNCH BREAK') continue;
    if (!state.nextOpen) continue;

    const nextOpen = DateTime.fromISO(state.nextOpen);
    const diff = nextOpen.diff(nowUtc, 'seconds').seconds;
    if (diff <= 0) continue;

    if (!nearest || diff < nearest.seconds) {
      nearest = { market: state.name, seconds: Math.floor(diff) };
    }
  }

  return nearest;
}

export function checkMarketOpenNotifications(
  previousStates: MarketState[],
  currentStates: MarketState[]
): MarketId[] {
  const opened: MarketId[] = [];

  for (const current of currentStates) {
    const previous = previousStates.find((p) => p.id === current.id);
    if (previous && previous.status !== 'OPEN' && current.status === 'OPEN') {
      opened.push(current.id);
    }
  }

  return opened;
}
