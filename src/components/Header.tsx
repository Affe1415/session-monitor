import { motion } from 'framer-motion';
import { Pin, Minus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LiveIndicator } from './LiveIndicator';

interface HeaderProps {
  accentColor: string;
  onMinimize: () => void;
  onClose: () => void;
}

export function Header({ accentColor, onMinimize, onClose }: HeaderProps) {
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    window.electronAPI?.isPinned().then(setPinned);
    const unsubscribe = window.electronAPI?.onPinChanged(setPinned);
    return () => unsubscribe?.();
  }, []);

  const handlePin = async () => {
    const next = await window.electronAPI?.togglePin();
    if (next !== undefined) setPinned(next);
  };

  return (
    <header className="drag-region flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
      <div className="flex items-center gap-2.5">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="no-drag flex h-7 w-7 items-center justify-center rounded-full border border-white/10"
          style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </motion.div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-sm font-semibold text-text leading-none">
            Session Monitor
          </h1>
          <LiveIndicator />
        </div>
      </div>

      <div className="no-drag flex items-center gap-0.5">
        <WindowButton
          onClick={handlePin}
          active={pinned}
          title={pinned ? 'Unpin' : 'Pin'}
        >
          <Pin
            className={`h-3.5 w-3.5 transition-transform ${pinned ? 'fill-current rotate-45' : ''}`}
          />
        </WindowButton>
        <WindowButton onClick={onMinimize} title="Minimize">
          <Minus className="h-3.5 w-3.5" />
        </WindowButton>
        <WindowButton
          onClick={onClose}
          title="Hide to tray"
          danger
        >
          <X className="h-3.5 w-3.5" />
        </WindowButton>
      </div>
    </header>
  );
}

interface WindowButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  danger?: boolean;
}

function WindowButton({ children, onClick, title, active, danger }: WindowButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text ${
        active ? 'text-blue' : ''
      } ${danger ? 'hover:text-red' : ''}`}
    >
      {children}
    </motion.button>
  );
}
