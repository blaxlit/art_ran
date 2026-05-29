const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');
const path = require('node:path');

const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const execFileAsync = promisify(execFile);

// Custom protocol used by the renderer's <audio> — main fetches the actual
// stream so we can attach headers and forward Range requests for seeking.
// Must be registered as privileged before app.whenReady fires.
protocol.registerSchemesAsPrivileged([

// Scale factor for pixel art
// Actual drawing area within 526x526 canvas: 306x497
// (23px top at bow, 110px left, 110px right, 6px bottom at heart)
const WIDTH = 415;
const HEIGHT = Math.round(415 * (497 / 306)); // maintain 306:497 aspect ratio

function createWindow() {
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    resizable: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    icon: path.join(__dirname, '..', 'assets', 'pink', 'favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
// Lock aspect ratio so only proportional resizing is allowed
  const ASPECT = WIDTH / HEIGHT;
  win.setAspectRatio(ASPECT);
// Window control handlers
  let preMaxBounds = null;

  const onMinimize = () => win.minimize();
const onMaximize = () => {
    if (preMaxBounds) {
      // Restore to previous size
      win.setBounds(preMaxBounds);
preMaxBounds = null;
    } else {
      // Fit to screen while maintaining aspect ratio
      preMaxBounds = win.getBounds();
const { workArea } = screen.getPrimaryDisplay();
      let newWidth = workArea.width;
      let newHeight = Math.round(newWidth / ASPECT);
if (newHeight > workArea.height) {
        newHeight = workArea.height;
        newWidth = Math.round(newHeight * ASPECT);
}
      const x = workArea.x + Math.round((workArea.width - newWidth) / 2);
const y = workArea.y + Math.round((workArea.height - newHeight) / 2);
      win.setBounds({ x, y, width: newWidth, height: newHeight });
}
  };
  const onClose = () => win.close();

  const onResize = (_e, { dx, dy, corner }) => {
    if (win.isDestroyed()) return;
const bounds = win.getBounds();

    const isRight = corner.includes('right');
    const isBottom = corner.includes('bottom');

    const effectiveDx = isRight ? dx : -dx;
const effectiveDy = isBottom ? dy : -dy;

    let delta;
if (Math.abs(effectiveDx) > Math.abs(effectiveDy)) {
      delta = effectiveDx;
} else {
      delta = effectiveDy;
    }

    const dw = Math.round(delta);
const newWidth = bounds.width + dw;
    const newHeight = Math.round(newWidth / ASPECT);
    const dh = newHeight - bounds.height;
const newBounds = {
      x: isRight ?
bounds.x : bounds.x - dw,
      y: isBottom ?
bounds.y : bounds.y - dh,
      width: newWidth,
      height: newHeight,
    };
if (newBounds.width >= 200 && newBounds.height >= 200) {
      win.setBounds(newBounds);
    }
  };
const onOpenExternal = (_e, url) => {
    if (typeof url === 'string' && url.startsWith('https://')) {
      if (url.includes('accounts.spotify.com/authorize')) {
        const authWin = new BrowserWindow({
          width: 500,
          height: 700,
          parent: win,
          modal: true,
          show: true,
        
  webPreferences: { nodeIntegration: false, contextIsolation: true },
        });
        authWin.loadURL(url);
const handleAuthRedirect = (event, callbackUrl) => {
          if (callbackUrl.startsWith('http://127.0.0.1:5173/callback')) {
            event.preventDefault();
const url = new URL(callbackUrl);
            let target;
            if (isDev) {
              target = `http://127.0.0.1:5173/${url.search}`;
} else {
              const fileUrl = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html'));
fileUrl.search = url.search;
              target = fileUrl.href;
            }
            win.loadURL(target);
            authWin.close();
}
        };
        authWin.webContents.on('will-redirect', handleAuthRedirect);
        authWin.webContents.on('will-navigate', handleAuthRedirect);
        return;
}
      shell.openExternal(url);
    }
  };
const onSetTheme = (_e, theme) => {
    const iconPath = path.join(__dirname, '..', 'assets', theme, 'favicon.png');
if (process.platform === 'darwin' && app.dock) {
      app.dock.setIcon(iconPath);
    }
    win.setIcon(iconPath);
  };
// --- ADD GLOBAL MEDIA KEYS ---
  win.on('focus', () => {
    // Optional: You can register keys globally or just when focused. 
    // We register them globally so they work while playing games/coding.
  });

  // Clean up shortcuts when the app closes so we don't hold the keys hostage
  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
ipcMain.on('window-minimize', onMinimize);
  ipcMain.on('window-maximize', onMaximize);
  ipcMain.on('window-close', onClose);
  ipcMain.on('window-resize', onResize);
  ipcMain.on('open-external', onOpenExternal);
  ipcMain.on('set-theme', onSetTheme);
// Clean up IPC listeners when window is destroyed
  win.on('closed', () => {
    ipcMain.removeListener('window-minimize', onMinimize);
    ipcMain.removeListener('window-maximize', onMaximize);
    ipcMain.removeListener('window-close', onClose);
    ipcMain.removeListener('window-resize', onResize);
    ipcMain.removeListener('open-external', onOpenExternal);
    ipcMain.removeListener('set-theme', onSetTheme);
  });

// Toggle DevTools with Cmd+Shift+I / Ctrl+Shift+I / F12
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.type !== 'keyDown') return;
    const isDevToolsShortcut = input.key.toLowerCase() === 'i' && input.shift && (input.meta || input.control);
    if (isDevToolsShortcut || input.key === 'F12') {
      win.webContents.toggleDevTools({ mode: 'detach' });
    }
  });
if (isDev) {
    win.loadURL('http://127.0.0.1:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}
}


app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(__dirname, '..', 'assets', 'pink', 'favicon.png'));
  }


 

  createWindow();
// Pre-warm both engines so the first track load skips cold-start

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
});