import { app, BrowserWindow, dialog, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';

let updateReady = false;

export function configureAutoUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-downloaded', (info) => {
    updateReady = true;
    mainWindow.webContents.send('update-downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
    });

    const title = `Session Monitor ${info.version} is ready`;
    const body = 'Restart the app to finish the update.';

    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  autoUpdater.on('error', (error) => {
    mainWindow.webContents.send('update-error', {
      message: error.message,
    });
  });
}

export async function checkForUpdates(showDialog = false): Promise<void> {
  if (!app.isPackaged) {
    if (showDialog) {
      await dialog.showMessageBox({
        type: 'info',
        title: 'Updates unavailable in development',
        message: 'Automatic updates are checked only in the packaged app.',
      });
    }
    return;
  }

  const result = await autoUpdater.checkForUpdates();
  if (showDialog && !result?.updateInfo) {
    await dialog.showMessageBox({
      type: 'info',
      title: 'Session Monitor is up to date',
      message: 'You are running the latest version.',
    });
  }
}

export function installUpdate(): void {
  if (updateReady) {
    autoUpdater.quitAndInstall(false, true);
  }
}
