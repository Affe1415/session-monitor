import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  screen,
  shell,
  Notification,
} from 'electron';
import path from 'path';
import {
  getSettings,
  setSettings,
  getWindowBounds,
  setWindowBounds,
  getWasPinned,
  setWasPinned,
} from './store';
import { checkForUpdates, configureAutoUpdater, installUpdate } from './updater';
import type { AppSettings, WindowBounds } from '../src/types';

const devServerUrl = process.env.VITE_DEV_SERVER_URL;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 760;

function getAppIconPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'icon.ico')
    : path.join(process.cwd(), 'build', 'icon.ico');
}

function createTrayIcon(): Electron.NativeImage {
  const icon = nativeImage.createFromPath(getAppIconPath());
  return icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 });
}

function createTray(): void {
  if (!tray) {
    tray = new Tray(createTrayIcon());
    tray.setToolTip('Session Monitor');
    tray.on('click', () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide();
      } else {
        showMainWindow();
      }
    });
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => showMainWindow(),
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: getSettings().alwaysOnTop,
      click: (menuItem) => {
        const settings = setSettings({ alwaysOnTop: menuItem.checked });
        mainWindow?.setAlwaysOnTop(settings.alwaysOnTop, 'floating');
        mainWindow?.webContents.send('settings-changed', settings);
      },
    },
    { type: 'separator' },
    {
      label: 'Launch on Startup',
      type: 'checkbox',
      checked: getSettings().autoStart,
      click: (menuItem) => {
        const settings = setSettings({ autoStart: menuItem.checked });
        applyWindowSettings(settings);
        mainWindow?.webContents.send('settings-changed', settings);
        createTray();
      },
    },
    {
      label: 'Settings',
      click: () => {
        showMainWindow();
        mainWindow?.webContents.send('open-settings');
      },
    },
    {
      label: 'Check for Updates',
      click: () => {
        void checkForUpdates(true);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function showMainWindow(): void {
  if (!mainWindow) return;
  mainWindow.show();
  mainWindow.focus();
}

function saveWindowBounds(): void {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  const boundsToSave: WindowBounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
  setWindowBounds(boundsToSave);
}

function getInitialBounds(): Electron.Rectangle {
  const saved = getWindowBounds();
  if (saved) {
    const display = screen.getDisplayNearestPoint({ x: saved.x, y: saved.y });
    const { x, y, width, height } = display.workArea;
    const fitsHorizontally = saved.x >= x && saved.x + saved.width <= x + width;
    const fitsVertically = saved.y >= y && saved.y + saved.height <= y + height;
    if (fitsHorizontally && fitsVertically) {
      return saved;
    }
  }

  const primary = screen.getPrimaryDisplay().workArea;
  return {
    x: Math.round(primary.x + (primary.width - WINDOW_WIDTH) / 2),
    y: Math.round(primary.y + (primary.height - WINDOW_HEIGHT) / 2),
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  };
}

function applyWindowSettings(settings: AppSettings): void {
  if (!mainWindow) return;
  mainWindow.setAlwaysOnTop(settings.alwaysOnTop, 'floating');
  mainWindow.setOpacity(settings.opacity);
  app.setLoginItemSettings({
    openAtLogin: settings.autoStart,
    path: process.execPath,
  });
}

function createWindow(): void {
  const bounds = getInitialBounds();
  const settings = getSettings();

  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 360,
    minHeight: 600,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    show: false,
    resizable: true,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: false,
    hasShadow: true,
    roundedCorners: true,
    icon: getAppIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  applyWindowSettings(settings);
  configureAutoUpdater(mainWindow);
  setWasPinned(settings.alwaysOnTop);

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      saveWindowBounds();
      mainWindow?.hide();
    }
  });

  mainWindow.on('moved', saveWindowBounds);
  mainWindow.on('resized', saveWindowBounds);

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    showMainWindow();
  });
}

function registerIpcHandlers(): void {
  ipcMain.handle('get-settings', () => getSettings());

  ipcMain.handle('set-settings', (_event, partial: Partial<AppSettings>) => {
    const updated = setSettings(partial);
    applyWindowSettings(updated);
    createTray();
    mainWindow?.webContents.send('settings-changed', updated);
    return updated;
  });

  ipcMain.handle('get-window-bounds', () => getWindowBounds());

  ipcMain.on('window-minimize', () => {
    saveWindowBounds();
    mainWindow?.hide();
  });

  ipcMain.on('window-close', () => {
    saveWindowBounds();
    mainWindow?.hide();
  });

  ipcMain.handle('window-toggle-pin', () => {
    const current = mainWindow?.isAlwaysOnTop() ?? getWasPinned();
    const next = !current;
    mainWindow?.setAlwaysOnTop(next, 'floating');
    setWasPinned(next);
    setSettings({ alwaysOnTop: next });
    mainWindow?.webContents.send('pin-changed', next);
    return next;
  });

  ipcMain.handle('window-is-pinned', () => mainWindow?.isAlwaysOnTop() ?? getWasPinned());

  ipcMain.on('window-set-opacity', (_event, opacity: number) => {
    mainWindow?.setOpacity(opacity);
  });

  ipcMain.on('play-notification-sound', () => {
    if (process.platform === 'win32') {
      shell.beep();
    }
  });

  ipcMain.on('show-notification', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show();
    }
  });

  ipcMain.handle('check-for-updates', () => checkForUpdates(true));
  ipcMain.on('install-update', () => installUpdate());
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerIpcHandlers();
  void checkForUpdates(false);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showMainWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  saveWindowBounds();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray on Windows
  }
});
