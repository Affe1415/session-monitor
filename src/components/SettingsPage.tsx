import { motion } from 'framer-motion';
import { ArrowLeft, Bell, RefreshCw, Volume2 } from 'lucide-react';
import { ACCENT_COLORS, ALL_MARKET_IDS } from '../constants/settings';
import { MARKETS } from '../services/marketHours';
import { FlagIcon } from './FlagIcon';
import type { AppSettings, MarketId } from '../types';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
  onClose: () => void;
}

export function SettingsPage({ settings, onUpdate, onClose }: SettingsPageProps) {
  const toggleMarket = (id: MarketId) => {
    const visible = settings.visibleMarkets.includes(id)
      ? settings.visibleMarkets.filter((m) => m !== id)
      : [...settings.visibleMarkets, id];
    onUpdate({ visibleMarkets: visible.length > 0 ? visible : [id] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex h-full flex-col"
    >
      <div className="drag-region flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="no-drag flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-white/5 hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </motion.button>
        <h2 className="text-sm font-semibold text-text">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <SettingSection title="Window">
          <ToggleSetting
            label="Always on Top"
            checked={settings.alwaysOnTop}
            onChange={(v) => onUpdate({ alwaysOnTop: v })}
          />
          <SliderSetting
            label="Opacity"
            value={Math.round(settings.opacity * 100)}
            min={70}
            max={100}
            suffix="%"
            onChange={(v) => onUpdate({ opacity: v / 100 })}
          />
          <ToggleSetting
            label="Compact Mode"
            checked={settings.compactMode}
            onChange={(v) => onUpdate({ compactMode: v })}
          />
          <ToggleSetting
            label="Auto Start with Windows"
            checked={settings.autoStart}
            onChange={(v) => onUpdate({ autoStart: v })}
          />
        </SettingSection>

        <SettingSection title="Appearance">
          <div>
            <p className="mb-2 text-xs text-text-secondary">Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onUpdate({ accentColor: color.value })}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    settings.accentColor === color.value
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <ToggleSetting
            label="Dark Mode"
            checked={settings.darkMode}
            onChange={(v) => onUpdate({ darkMode: v })}
          />
        </SettingSection>

        <SettingSection title="Clock">
          <ToggleSetting
            label="24-Hour Format"
            checked={settings.use24Hour}
            onChange={(v) => onUpdate({ use24Hour: v })}
          />
          <ToggleSetting
            label="Show Seconds"
            checked={settings.showSeconds}
            onChange={(v) => onUpdate({ showSeconds: v })}
          />
        </SettingSection>

        <SettingSection title="Markets">
          <p className="mb-2 text-xs text-text-secondary">Visible Markets</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_MARKET_IDS.map((id) => {
              const market = MARKETS[id];
              const selected = settings.visibleMarkets.includes(id);
              return (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleMarket(id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                    selected
                      ? 'border-blue/40 bg-blue/10 text-text'
                      : 'border-white/[0.08] text-text-secondary hover:bg-white/5'
                  }`}
                >
                  <FlagIcon countryCode={market.countryCode} className="h-5 w-5" />
                  <span>{market.name}</span>
                </motion.button>
              );
            })}
          </div>
        </SettingSection>

        <SettingSection title="Notifications">
          <ToggleSetting
            label="Sound on Market Open"
            checked={settings.soundNotifications}
            onChange={(v) => onUpdate({ soundNotifications: v })}
            icon={<Volume2 className="h-3.5 w-3.5" />}
          />
          <ToggleSetting
            label="Notify when London Opens"
            checked={settings.notifyLondonOpen}
            onChange={(v) => onUpdate({ notifyLondonOpen: v })}
            icon={<Bell className="h-3.5 w-3.5" />}
          />
          <ToggleSetting
            label="Notify when New York Opens"
            checked={settings.notifyNewYorkOpen}
            onChange={(v) => onUpdate({ notifyNewYorkOpen: v })}
            icon={<Bell className="h-3.5 w-3.5" />}
          />
        </SettingSection>

        <SettingSection title="Updates">
          <ActionSetting
            label="Check for Updates"
            onClick={() => void window.electronAPI?.checkForUpdates()}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
          />
        </SettingSection>
      </div>
    </motion.div>
  );
}

function ActionSetting({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.04)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="no-drag flex w-full items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5 text-sm text-text"
    >
      <span className="flex items-center gap-2">
        {icon && <span className="text-text-secondary">{icon}</span>}
        {label}
      </span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-text-secondary">
        Manual
      </span>
    </motion.button>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ToggleSetting({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm text-text">
        {icon && <span className="text-text-secondary">{icon}</span>}
        {label}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-blue' : 'bg-white/10'
        }`}
      >
        <motion.span
          layout
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

function SliderSetting({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-text">{label}</span>
        <span className="font-mono text-text-secondary">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="no-drag h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-blue"
      />
    </div>
  );
}
