const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

// Scale factor to maintain the original sleek window aspect ratio
const WIDTH = 415;
const HEIGHT = Math.round(415 * (497 / 306)); 

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

  const ASPECT = WIDTH / HEIGHT;
  win.setAspectRatio(ASPECT);

  // Window control handlers for the custom React buttons
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-close', () => win.close());

  const onResize = (_e, { dx, dy, corner }) => {
    if (win.isDestroyed()) return;
    const bounds = win.getBounds();
    const isRight = corner.includes('right');
    const isBottom = corner.includes('bottom');
    const effectiveDx = isRight ? dx : -dx;
    const effectiveDy = isBottom ? dy : -dy;

    let delta = Math.abs(effectiveDx) > Math.abs(effectiveDy) ? effectiveDx : effectiveDy;
    const dw = Math.round(delta);
    const newWidth = bounds.width + dw;
    const newHeight = Math.round(newWidth / ASPECT);
    const dh = newHeight - bounds.height;

    const newBounds = {
      x: isRight ? bounds.x : bounds.x - dw,
      y: isBottom ? bounds.y : bounds.y - dh,
      width: newWidth,
      height: newHeight,
    };
    if (newBounds.width >= 200 && newBounds.height >= 200) {
      win.setBounds(newBounds);
    }
  };
  ipcMain.on('window-resize', onResize);

  // Load the React app
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://127.0.0.1:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

// --- NEW RANDOMIZER DATA HANDLER ---
// This reads your character pool file and sends it to the React frontend
ipcMain.handle('get-pool-data', () => {
  try {
    const dataPath = path.join(app.getPath('userData'), 'pool.json');
    if (!fs.existsSync(dataPath)) {
      // If no custom file exists yet, return a default template
      return {
        characters: [
          { name: "Shiroko", game: "Blue Archive" },
          { name: "Aru", game: "Blue Archive" }
        ],
        modifiers: {
          themes: ["Techwear", "Casual Streetwear", "Cafe Uniform"],
          poses: ["Action shot", "Looking over shoulder"]
        }
      };
    }
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load pool data:", err);
    return null;
  }
});

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(__dirname, '..', 'assets', 'pink', 'favicon.png'));
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});