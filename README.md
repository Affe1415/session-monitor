# Session Monitor

Professional Trading Session Monitor for Windows.

Session Monitor is an Electron, React, TypeScript, TailwindCSS and Framer Motion desktop application for tracking global market sessions, overlap windows, market status and upcoming session openings.

The production goal is simple: an end user downloads `SessionMonitorSetup.exe`, installs it, and launches Session Monitor from the desktop or Start Menu. They should never need Node.js, npm or a terminal.

## Features

- Borderless transparent Windows desktop app with rounded corners and acrylic background.
- Always-on-top mode with a native tray menu.
- Persistent window position, size, opacity, visible markets and settings.
- Native Windows startup integration.
- Native tray menu: Open, Always On Top, Launch on Startup, Settings, Check for Updates, Quit.
- Secure Electron preload bridge with `contextIsolation`, disabled `nodeIntegration` and sandbox enabled.
- Automatic updates with `electron-updater` and GitHub Releases.
- Windows installers via Electron Builder: NSIS setup, portable EXE and MSI.
- Smooth rolling digit clocks, premium status motion and Reduce Motion support.

## Development

Install dependencies:

```bash
npm install
```

Run the React dev server:

```bash
npm run dev
```

Run Electron with Vite in development:

```bash
npm run electron:dev
```

Build the application:

```bash
npm run build
```

Run the built app locally:

```bash
npm start
```

On Windows PowerShell, if npm scripts are blocked by execution policy, run commands through `cmd /c`, for example:

```powershell
cmd /c npm start
```

## Packaging

Create all Windows release artifacts:

```bash
npm run dist
```

Expected output in `release/`:

- `SessionMonitorSetup.exe`
- `SessionMonitorPortable.exe`
- `SessionMonitor.msi`

Create only the portable build:

```bash
npm run portable
```

Publish a GitHub Release build:

```bash
npm run release
```

`npm run release` requires `GH_TOKEN` to be available in the environment.

## GitHub Releases And Auto Updates

Auto updates are powered by `electron-updater`.

Before publishing production releases, update the `build.publish` section in `package.json`:

```json
{
  "provider": "github",
  "owner": "YOUR_GITHUB_USERNAME",
  "repo": "session-monitor"
}
```

Then create and push a version tag:

```bash
npm version patch
git push
git push --tags
```

When a tag such as `v1.0.1` is pushed, `.github/workflows/release.yml` will:

- install dependencies
- build the application
- package Windows installers
- create or update a GitHub Release
- upload the setup, portable and MSI artifacts

Packaged applications check GitHub Releases on startup. When a newer version is available, it downloads in the background and shows an update-ready notification. The user can restart and install from the in-app update button.

## Windows Installer Behavior

The NSIS installer is configured for a commercial Windows app experience:

- welcome/install flow
- install location selection
- desktop shortcut
- Start Menu shortcut
- launch after install
- proper uninstall registration
- silent install support through NSIS command-line flags

Useful silent install examples:

```powershell
SessionMonitorSetup.exe /S
SessionMonitorSetup.exe /S /D=C:\Tools\SessionMonitor
```

## Icons

The app currently uses `src/assets/icon.svg` as the source brand asset.

For production distribution, generate and commit these files from the same source artwork:

- `build/icon.ico` for Windows, installer, taskbar and shortcuts
- `build/icon.png` for release metadata
- `build/icon.icns` if macOS support is added later

After generating `build/icon.ico`, update `package.json`:

```json
"win": {
  "icon": "build/icon.ico"
}
```

## Code Signing

The project is prepared to run unsigned during development. For commercial Windows distribution, sign releases with a code signing certificate.

Recommended future setup:

- EV or OV Windows code signing certificate
- store certificate secrets in GitHub Actions secrets
- configure Electron Builder signing environment variables:
  - `CSC_LINK`
  - `CSC_KEY_PASSWORD`
  - `WIN_CSC_LINK`
  - `WIN_CSC_KEY_PASSWORD`

Do not commit private certificates or passwords to the repository.

## Security Notes

Electron BrowserWindow security settings:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- renderer communicates through a typed preload API only

Keep IPC narrow and explicit. Avoid exposing generic filesystem, shell or process APIs to the renderer.

## Project Structure

```text
electron/
  main.ts          Main process, tray, window lifecycle, IPC
  preload.ts       Secure renderer bridge
  store.ts         Persistent settings and window state
  updater.ts       GitHub Releases auto update integration

src/
  assets/          Static brand assets
  components/      React UI components
  constants/       Market and UI constants
  hooks/           React hooks
  services/        Market hours, overlaps, events
  types/           Shared TypeScript types
  utils/           Formatting helpers

.github/workflows/
  release.yml      Tag-based Windows release publishing
```

## Versioning

Use semantic versions:

- patch: fixes and small UI polish
- minor: new features
- major: breaking or large product changes

Release example:

```bash
npm version patch
git push
git push --tags
```

## Supported Markets

Sydney, Tokyo, Hong Kong, Frankfurt, London, New York, Chicago and Toronto.
