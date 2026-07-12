import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Header } from './components/Header';
import { CurrentSessionCard } from './components/CurrentSessionCard';
import { MarketsList } from './components/MarketsList';
import { BottomBar } from './components/BottomBar';
import { SettingsPage } from './components/SettingsPage';
import { EconomicEvents } from './components/EconomicEvents';
import { useSettings } from './hooks/useSettings';
import { useMarketData } from './hooks/useMarketData';

export function App() {
  const { settings, updateSettings, loaded } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const { markets, activeSession, overlap, nextOpen, economicEvents } =
    useMarketData(settings);

  useEffect(() => {
    const removeOpenSettings = window.electronAPI?.onOpenSettings(() => {
      setShowSettings(true);
    });
    const removeUpdateDownloaded = window.electronAPI?.onUpdateDownloaded((info) => {
      setUpdateVersion(info.version);
    });

    return () => {
      removeOpenSettings?.();
      removeUpdateDownloaded?.();
    };
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-6 w-6 rounded-full border-2 border-white/20 border-t-blue"
        />
      </div>
    );
  }

  const session =
    activeSession ??
    markets.find((m) => m.id === 'newyork') ??
    markets[0];

  const defaultOverlap = {
    markets: ['London', 'New York'] as [string, string],
    countdownSeconds: 0,
  };

  const hideWindow = (hide: () => void) => {
    setIsHiding(true);
    window.setTimeout(() => {
      hide();
      setIsHiding(false);
    }, reduceMotion ? 80 : 180);
  };

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      animate={
        reduceMotion
          ? { opacity: isHiding ? 0 : settings.opacity }
          : { opacity: isHiding ? 0 : settings.opacity, scale: isHiding ? 0.97 : 1 }
      }
      transition={{ duration: reduceMotion ? 0.12 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-screen w-full flex-col overflow-hidden rounded-window glass-panel shadow-window"
    >
      <AnimatePresence mode="wait">
        {showSettings ? (
          <SettingsPage
            key="settings"
            settings={settings}
            onUpdate={updateSettings}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col overflow-hidden"
          >
            <Header
              accentColor={settings.accentColor}
              onMinimize={() => hideWindow(() => window.electronAPI?.minimizeWindow())}
              onClose={() => hideWindow(() => window.electronAPI?.closeWindow())}
            />

            <div className="flex-1 overflow-y-auto pb-2">
              {session && (
                <CurrentSessionCard session={session} settings={settings} />
              )}

              <MarketsList markets={markets} compact={settings.compactMode} />

              <EconomicEvents
                events={economicEvents}
                accentColor={settings.accentColor}
              />
            </div>

            <BottomBar
              overlapMarkets={
                overlap?.markets ?? defaultOverlap.markets
              }
              overlapSeconds={
                overlap?.countdownSeconds ?? defaultOverlap.countdownSeconds
              }
              nextOpenMarket={nextOpen?.market}
              nextOpenSeconds={nextOpen?.seconds}
              onOpenSettings={() => setShowSettings(true)}
              updateVersion={updateVersion}
              onInstallUpdate={() => window.electronAPI?.installUpdate()}
              accentColor={settings.accentColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
