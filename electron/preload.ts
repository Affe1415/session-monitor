import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings } from '../src/types';

const electronAPI = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('set-settings', settings),
  getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
  minimizeWindow: (): void => ipcRenderer.send('window-minimize'),
  closeWindow: (): void => ipcRenderer.send('window-close'),
  togglePin: (): Promise<boolean> => ipcRenderer.invoke('window-toggle-pin'),
  isPinned: (): Promise<boolean> => ipcRenderer.invoke('window-is-pinned'),
  setOpacity: (opacity: number): void => ipcRenderer.send('window-set-opacity', opacity),
  onSettingsChanged: (callback: (settings: AppSettings) => void) => {
    const handler = (_: Electron.IpcRendererEvent, settings: AppSettings) => callback(settings);
    ipcRenderer.on('settings-changed', handler);
    return () => ipcRenderer.removeListener('settings-changed', handler);
  },
  onPinChanged: (callback: (pinned: boolean) => void) => {
    const handler = (_: Electron.IpcRendererEvent, pinned: boolean) => callback(pinned);
    ipcRenderer.on('pin-changed', handler);
    return () => ipcRenderer.removeListener('pin-changed', handler);
  },
  playNotificationSound: (): void => ipcRenderer.send('play-notification-sound'),
  showNotification: (title: string, body: string): void =>
    ipcRenderer.send('show-notification', title, body),
  checkForUpdates: (): Promise<void> => ipcRenderer.invoke('check-for-updates'),
  installUpdate: (): void => ipcRenderer.send('install-update'),
  onOpenSettings: (callback: () => void) => {
    ipcRenderer.on('open-settings', callback);
    return () => ipcRenderer.removeListener('open-settings', callback);
  },
  onUpdateDownloaded: (callback: (info: { version: string; releaseDate?: string }) => void) => {
    const handler = (
      _: Electron.IpcRendererEvent,
      info: { version: string; releaseDate?: string }
    ) => callback(info);
    ipcRenderer.on('update-downloaded', handler);
    return () => ipcRenderer.removeListener('update-downloaded', handler);
  },
  onUpdateError: (callback: (error: { message: string }) => void) => {
    const handler = (_: Electron.IpcRendererEvent, error: { message: string }) =>
      callback(error);
    ipcRenderer.on('update-error', handler);
    return () => ipcRenderer.removeListener('update-error', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
