import Store from 'electron-store';
import type { AppSettings, WindowBounds } from '../src/types';

const DEFAULT_SETTINGS: AppSettings = {
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

interface StoreSchema {
  settings: AppSettings;
  windowBounds: WindowBounds | null;
  wasPinned: boolean;
}

const store = new Store<StoreSchema>({
  defaults: {
    settings: DEFAULT_SETTINGS,
    windowBounds: null,
    wasPinned: true,
  },
});

export function getSettings(): AppSettings {
  return store.get('settings');
}

export function setSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  store.set('settings', updated);
  return updated;
}

export function getWindowBounds(): WindowBounds | null {
  return store.get('windowBounds');
}

export function setWindowBounds(bounds: WindowBounds): void {
  store.set('windowBounds', bounds);
}

export function getWasPinned(): boolean {
  return store.get('wasPinned');
}

export function setWasPinned(pinned: boolean): void {
  store.set('wasPinned', pinned);
}

export { store };
