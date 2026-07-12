# Session Monitor

Session Monitor is a premium Windows desktop app for tracking global trading sessions in real time.

It shows which markets are open, closed, in pre-market, after-hours, holiday mode, or lunch break, with live local clocks and session overlap countdowns for active trading windows.

## Highlights

- Global market session monitor for Sydney, Tokyo, Hong Kong, Frankfurt, London, New York, Chicago, and Toronto.
- Borderless, transparent Windows desktop window with rounded corners and always-on-top support.
- Smooth rolling digit clocks and calm status animations.
- Native Windows tray menu with Open, Always On Top, Launch on Startup, Settings, Check for Updates, and Quit.
- Persistent settings, visible markets, opacity, window size, and window position.
- Optional launch on Windows startup.
- Automatic updates through GitHub Releases.
- Production packaging with NSIS setup, portable EXE, and MSI builds.

## Download

Download the latest installer from the repository's GitHub Releases page.

For most users, choose:

```text
SessionMonitorSetup.exe
```

Portable and MSI builds are also generated:

```text
SessionMonitorPortable.exe
SessionMonitor.msi
```

## Installation

1. Download `SessionMonitorSetup.exe`.
2. Run the installer.
3. Launch Session Monitor from the desktop or Start Menu.
4. Use the tray icon to reopen, pin, update, or quit the app.

End users do not need Node.js, npm, or a terminal.

## Built With

- Electron
- React
- TypeScript
- TailwindCSS
- Framer Motion
- Luxon
- Electron Builder
- Electron Updater

## Development

Install dependencies:

```bash
npm install
```

Run the React development server:

```bash
npm run dev
```

Run Electron with Vite:

```bash
npm run electron:dev
```

Build the app:

```bash
npm run build
```

Run the built app locally:

```bash
npm start
```

On Windows PowerShell, if npm scripts are blocked by execution policy, use:

```powershell
cmd /c npm start
```

## Packaging

Create all Windows distribution artifacts:

```bash
npm run dist
```

Expected output:

```text
release/SessionMonitorSetup.exe
release/SessionMonitorPortable.exe
release/SessionMonitor.msi
```

Create only the portable executable:

```bash
npm run portable
```

Publish a GitHub Release build:

```bash
npm run release
```

Publishing requires `GH_TOKEN` in the environment.

## GitHub Releases

Releases are automated by `.github/workflows/release.yml`.

When a version tag is pushed, for example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will:

- install dependencies
- build the app
- package Windows installers
- create a GitHub Release
- upload setup, portable, and MSI assets

Before publishing, update `package.json`:

```json
{
  "provider": "github",
  "owner": "YOUR_GITHUB_USERNAME",
  "repo": "session-monitor"
}
```

Replace `YOUR_GITHUB_USERNAME` with the actual GitHub user or organization that owns the repository.

## Auto Updates

Session Monitor uses `electron-updater`.

Packaged builds check GitHub Releases on startup. When a newer release is available, the app downloads it in the background and shows an update-ready notification. The user can restart and install the update from inside the app.

Auto updates require:

- a packaged build
- a GitHub Release with uploaded installer assets
- the correct `owner` and `repo` values in `package.json`

## Windows Installer

The NSIS installer is configured with:

- installation wizard
- install location selection
- desktop shortcut
- Start Menu shortcut
- launch after install
- uninstall registration
- silent install support

Silent install examples:

```powershell
SessionMonitorSetup.exe /S
SessionMonitorSetup.exe /S /D=C:\Tools\SessionMonitor
```

## Icons

Windows icon assets are generated into `build/`.

To regenerate icons:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\generate-icons.ps1
```

Generated files include:

- `build/icon.ico`
- `build/icon.png`
- `build/icons/icon-16.png`
- `build/icons/icon-24.png`
- `build/icons/icon-32.png`
- `build/icons/icon-48.png`
- `build/icons/icon-64.png`
- `build/icons/icon-128.png`
- `build/icons/icon-256.png`

## Security

The Electron renderer runs with:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`

The renderer communicates with the main process through a typed preload API. Avoid exposing generic filesystem, shell, or process access to the renderer.

## Code Signing

The project works unsigned during development.

For commercial distribution, sign Windows builds with an OV or EV code signing certificate. Store signing credentials as GitHub Actions secrets and configure Electron Builder signing variables such as:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`
- `WIN_CSC_LINK`
- `WIN_CSC_KEY_PASSWORD`

Never commit certificates or passwords to the repository.

## Project Structure

```text
electron/
  main.ts          Main process, tray, window lifecycle, IPC
  preload.ts       Secure renderer bridge
  store.ts         Persistent settings and window state
  updater.ts       GitHub Releases auto-update integration

src/
  assets/          Static assets
  components/      React UI components
  constants/       App constants
  hooks/           React hooks
  services/        Market hours, overlaps, and economic events
  types/           Shared TypeScript types
  utils/           Formatting helpers

scripts/
  generate-icons.ps1

.github/workflows/
  release.yml
```

## Versioning

Use semantic versioning:

- patch for fixes and polish
- minor for new features
- major for breaking changes

Example:

```bash
npm version patch
git push
git push --tags
```

## License

MIT
