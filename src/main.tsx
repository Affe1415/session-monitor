import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { DEFAULT_SETTINGS } from './constants/settings';

if (!window.electronAPI) {
  window.electronAPI = {
    getSettings: async () => DEFAULT_SETTINGS,
    setSettings: async (partial) => ({ ...DEFAULT_SETTINGS, ...partial }),
    getWindowBounds: async () => null,
    minimizeWindow: () => undefined,
    closeWindow: () => undefined,
    togglePin: async () => true,
    isPinned: async () => true,
    setOpacity: () => undefined,
    onSettingsChanged: () => () => undefined,
    onPinChanged: () => () => undefined,
    playNotificationSound: () => undefined,
    showNotification: () => undefined,
    checkForUpdates: async () => undefined,
    installUpdate: () => undefined,
    onOpenSettings: () => () => undefined,
    onUpdateDownloaded: () => () => undefined,
    onUpdateError: () => () => undefined,
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
