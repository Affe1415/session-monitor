import type { AppSettings, MarketId } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  alwaysOnTop: true,
  opacity: 0.96,
  accentColor: '#4EA1FF',
  visibleMarkets: ['sydney', 'tokyo', 'london', 'newyork', 'hongkong'],
  use24Hour: false,
  showSeconds: true,
  compactMode: false,
  darkMode: true,
  autoStart: false,
  soundNotifications: false,
  notifyLondonOpen: true,
  notifyNewYorkOpen: true,
};

export const ACCENT_COLORS = [
  { name: 'Blue', value: '#4EA1FF' },
  { name: 'Green', value: '#2ECC71' },
  { name: 'Orange', value: '#F5A623' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Red', value: '#E74C3C' },
  { name: 'Cyan', value: '#22D3EE' },
];

export const ALL_MARKET_IDS: MarketId[] = [
  'sydney',
  'tokyo',
  'hongkong',
  'frankfurt',
  'london',
  'newyork',
  'chicago',
  'toronto',
];
