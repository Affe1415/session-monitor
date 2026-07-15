import { app, BrowserWindow, dialog, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import type { UpdateInfo } from 'electron-updater';

let updateReady = false;
let updateReadyVersion: string | null = null;

export function configureAutoUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-downloaded', (info) => {
    updateReady = true;
    updateReadyVersion = info.version;
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
  if (updateReady) {
    if (showDialog) {
      const result = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart & Update', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update ready',
        message: updateReadyVersion
          ? `Session Monitor ${updateReadyVersion} is ready to install.`
          : 'An update is ready to install.',
        detail: 'Restart Session Monitor to finish the update.',
      });

      if (result.response === 0) {
        installUpdate();
      }
    }
    return;
  }

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

  const finishManualCheck: { current?: () => void } = {};

  const manualCheck = showDialog
    ? new Promise<void>((resolve) => {
        finishManualCheck.current = resolve;

        const cleanup = () => {
          autoUpdater.removeListener('update-available', onUpdateAvailable);
          autoUpdater.removeListener('update-not-available', onUpdateNotAvailable);
          autoUpdater.removeListener('update-downloaded', onUpdateDownloaded);
          autoUpdater.removeListener('error', onError);
        };

        const finish = () => {
          cleanup();
          resolve();
        };

        const onUpdateAvailable = (info: UpdateInfo) => {
          void dialog.showMessageBox({
            type: 'info',
            title: 'Update found',
            message: `Session Monitor ${info.version} is available.`,
            detail: 'The update will download in the background.',
          });
          finish();
        };

        const onUpdateNotAvailable = () => {
          void dialog.showMessageBox({
            type: 'info',
            title: 'Session Monitor is up to date',
            message: 'You are running the latest version.',
          });
          finish();
        };

        const onUpdateDownloaded = (info: UpdateInfo) => {
          void dialog
            .showMessageBox({
              type: 'info',
              buttons: ['Restart & Update', 'Later'],
              defaultId: 0,
              cancelId: 1,
              title: 'Update ready',
              message: `Session Monitor ${info.version} is ready to install.`,
              detail: 'Restart Session Monitor to finish the update.',
            })
            .then((result) => {
              if (result.response === 0) {
                installUpdate();
              }
            });
          finish();
        };

        const onError = (error: Error) => {
          void dialog.showMessageBox({
            type: 'error',
            title: 'Update check failed',
            message: 'Session Monitor could not check for updates.',
            detail: error.message,
          });
          finish();
        };

        autoUpdater.once('update-available', onUpdateAvailable);
        autoUpdater.once('update-not-available', onUpdateNotAvailable);
        autoUpdater.once('update-downloaded', onUpdateDownloaded);
        autoUpdater.once('error', onError);
      })
    : null;

  try {
    await autoUpdater.checkForUpdates();
    await manualCheck;
  } catch (error) {
    finishManualCheck.current?.();
    if (showDialog) {
      await dialog.showMessageBox({
        type: 'error',
        title: 'Update check failed',
        message: 'Session Monitor could not check for updates.',
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export function installUpdate(): void {
  if (updateReady) {
    autoUpdater.quitAndInstall(false, true);
  }
}
