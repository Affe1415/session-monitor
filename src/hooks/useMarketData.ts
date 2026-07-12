import { useEffect, useRef, useState } from 'react';
import {
  checkMarketOpenNotifications,
  getActiveSessionMarket,
  getAllMarketStates,
  getNextMarketOpenCountdown,
  getNextSessionOverlap,
} from '../services/marketHours';
import { getTodaysEconomicEvents } from '../services/economicEvents';
import type { AppSettings, MarketState, SessionOverlap } from '../types';
import type { EconomicEvent } from '../types';
import { useUtcNow } from './useClock';

interface MarketData {
  markets: MarketState[];
  activeSession: MarketState | null;
  overlap: SessionOverlap | null;
  nextOpen: { market: string; seconds: number } | null;
  economicEvents: EconomicEvent[];
}

export function useMarketData(settings: AppSettings): MarketData {
  const nowUtc = useUtcNow(settings.showSeconds);
  const previousStatesRef = useRef<MarketState[]>([]);
  const [data, setData] = useState<MarketData>({
    markets: [],
    activeSession: null,
    overlap: null,
    nextOpen: null,
    economicEvents: [],
  });

  useEffect(() => {
    const markets = getAllMarketStates(
      settings.visibleMarkets,
      settings.use24Hour,
      settings.showSeconds,
      nowUtc
    );
    const activeSession = getActiveSessionMarket(markets);
    const overlap = getNextSessionOverlap(nowUtc);
    const nextOpen = getNextMarketOpenCountdown(markets, nowUtc);
    const economicEvents = getTodaysEconomicEvents(settings.use24Hour, nowUtc);

    const openedMarkets =
      previousStatesRef.current.length > 0
        ? checkMarketOpenNotifications(previousStatesRef.current, markets)
        : [];
    if (openedMarkets.length > 0) {
      for (const marketId of openedMarkets) {
        const market = markets.find((m) => m.id === marketId);
        if (!market) continue;

        const shouldShowNotification =
          (marketId === 'london' && settings.notifyLondonOpen) ||
          (marketId === 'newyork' && settings.notifyNewYorkOpen);

        if (shouldShowNotification) {
          window.electronAPI?.showNotification(
            `${market.name} Market Open`,
            `${market.exchange} is now open for trading.`
          );
        }

        if (settings.soundNotifications) {
          window.electronAPI?.playNotificationSound();
        }
      }
    }

    previousStatesRef.current = markets;

    setData({
      markets,
      activeSession,
      overlap,
      nextOpen,
      economicEvents,
    });
  }, [nowUtc, settings]);

  return data;
}
