export type MarketStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'LUNCH BREAK'
  | 'HOLIDAY'
  | 'PRE-MARKET'
  | 'AFTER HOURS';

export type MarketId =
  | 'sydney'
  | 'tokyo'
  | 'hongkong'
  | 'frankfurt'
  | 'london'
  | 'newyork'
  | 'chicago'
  | 'toronto';

export interface MarketSession {
  open: string;
  close: string;
  lunchStart?: string;
  lunchEnd?: string;
  preMarketStart?: string;
  afterHoursEnd?: string;
}

export interface MarketDefinition {
  id: MarketId;
  name: string;
  exchange: string;
  timezone: string;
  countryCode: string;
  flag: string;
  sessions: MarketSession[];
  holidays: string[];
}

export interface MarketState {
  id: MarketId;
  name: string;
  exchange: string;
  timezone: string;
  countryCode: string;
  flag: string;
  localTime: string;
  timezoneLabel: string;
  status: MarketStatus;
  statusDetail?: string;
  isActiveSession: boolean;
  nextOpen?: string;
  isOverlapping?: boolean;
}

export interface SessionOverlap {
  markets: [string, string];
  startsAt: string;
  countdownSeconds: number;
}

export interface EconomicEvent {
  id: string;
  time: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  currency: string;
}

export interface AppSettings {
  alwaysOnTop: boolean;
  opacity: number;
  accentColor: string;
  visibleMarkets: MarketId[];
  use24Hour: boolean;
  showSeconds: boolean;
  compactMode: boolean;
  darkMode: boolean;
  autoStart: boolean;
  soundNotifications: boolean;
  notifyLondonOpen: boolean;
  notifyNewYorkOpen: boolean;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElectronAPI {
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  getWindowBounds: () => Promise<WindowBounds | null>;
  minimizeWindow: () => void;
  closeWindow: () => void;
  togglePin: () => Promise<boolean>;
  isPinned: () => Promise<boolean>;
  setOpacity: (opacity: number) => void;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
  onPinChanged: (callback: (pinned: boolean) => void) => () => void;
  playNotificationSound: () => void;
  showNotification: (title: string, body: string) => void;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => void;
  onOpenSettings: (callback: () => void) => () => void;
  onUpdateDownloaded: (
    callback: (info: { version: string; releaseDate?: string }) => void
  ) => () => void;
  onUpdateError: (callback: (error: { message: string }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
