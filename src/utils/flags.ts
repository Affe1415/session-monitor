import { MARKETS } from '../services/marketHours';
import type { MarketId } from '../types';

export function getMarketFlag(marketId: MarketId): string {
  return MARKETS[marketId].flag;
}

export function getMarketLabel(marketId: MarketId): string {
  const market = MARKETS[marketId];
  return `${market.name} (${market.exchange})`;
}
