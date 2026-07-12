import { useCallback, useEffect, useState } from 'react';
import type { AppSettings } from '../types';

const FALLBACK_SETTINGS: AppSettings = {
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

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(FALLBACK_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (window.electronAPI) {
          const saved = await window.electronAPI.getSettings();
          setSettingsState(saved);
        }
      } catch (error) {
        console.error('Failed to load settings, using defaults.', error);
      } finally {
        setLoaded(true);
      }
    };
    load();

    const unsubscribe = window.electronAPI?.onSettingsChanged((newSettings) => {
      setSettingsState(newSettings);
    });

    return () => unsubscribe?.();
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    if (window.electronAPI) {
      const updated = await window.electronAPI.setSettings(partial);
      setSettingsState(updated);
      if (partial.opacity !== undefined) {
        window.electronAPI.setOpacity(partial.opacity);
      }
      return updated;
    }

    setSettingsState((prev) => ({ ...prev, ...partial }));
    return { ...settings, ...partial };
  }, [settings]);

  return { settings, updateSettings, loaded };
}
