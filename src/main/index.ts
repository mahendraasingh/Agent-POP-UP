import { app, ipcMain, globalShortcut, Tray, Menu, nativeImage, shell } from 'electron';
import path from 'path';
import { WindowManager } from './window';
import { SettingsStore } from './store/settings';
import { RequestManager } from './queue/requestManager';
import { IngestServer } from './server/ingestServer';
import { ActionType, IPC_CHANNELS, AgentDockSettings } from '../shared/types';

let windowManager: WindowManager | null = null;
let settingsStore: SettingsStore | null = null;
let requestManager: RequestManager | null = null;
let ingestServer: IngestServer | null = null;
let tray: Tray | null = null;

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    windowManager?.show();
  });
}

async function initApp() {
  settingsStore = new SettingsStore();
  const settings = settingsStore.get();

  windowManager = new WindowManager(settings);
  requestManager = new RequestManager();
  ingestServer = new IngestServer(requestManager);

  await ingestServer.start();

  const win = windowManager.createWindow();

  // Forward request events to renderer
  requestManager.on('requests-updated', (requests) => {
    win.webContents.send(IPC_CHANNELS.REQUEST_UPDATED, requests);
    // If new pending request arrives, ensure window is visible
    const pending = requests.filter((r: { status: string }) => r.status === 'pending');
    if (pending.length > 0) {
      windowManager?.show();
    }
  });

  requestManager.on('agents-updated', (agents) => {
    win.webContents.send(IPC_CHANNELS.AGENTS_UPDATED, agents);
  });

  setupIpcHandlers();
  setupTray();
  setupGlobalShortcut(settings.hotkey);
}

function setupIpcHandlers() {
  if (!windowManager || !settingsStore || !requestManager) return;

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    windowManager?.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_HIDE, () => {
    windowManager?.hide();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_SHOW, () => {
    windowManager?.show();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_EXPAND, (_e, expand?: boolean) => {
    return windowManager?.toggleExpand(expand);
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_MODE, (_e, mode: import('../shared/types').WindowViewMode) => {
    return windowManager?.setMode(mode);
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_MODE, () => {
    return windowManager?.getMode() ?? 'icon';
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, (_e, alwaysOnTop: boolean) => {
    windowManager?.setAlwaysOnTop(alwaysOnTop);
    settingsStore?.update({ alwaysOnTop });
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_BOUNDS, () => {
    const win = windowManager?.getWindow();
    if (!win) return { x: 0, y: 0, width: 440, height: 260 };
    const bounds = win.getBounds();
    return bounds;
  });

  ipcMain.handle(IPC_CHANNELS.REQUEST_GET_ALL, () => {
    return requestManager?.getAllRequests();
  });

  ipcMain.handle(IPC_CHANNELS.REQUEST_RESPOND, (_e, { id, action, input }: { id: string; action: ActionType; input?: string }) => {
    return requestManager?.respond(id, action, input);
  });

  ipcMain.handle(IPC_CHANNELS.REQUEST_DISMISS, (_e, id: string) => {
    return requestManager?.dismiss(id);
  });

  ipcMain.handle(IPC_CHANNELS.REQUEST_CLEAR_HISTORY, () => {
    requestManager?.clearHistory();
  });

  ipcMain.handle(IPC_CHANNELS.AGENTS_GET_ALL, () => {
    return requestManager?.getAllAgents();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return settingsStore?.get();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SAVE, (_e, patch: Partial<AgentDockSettings>) => {
    const updated = settingsStore?.update(patch);
    if (patch.alwaysOnTop !== undefined) {
      windowManager?.setAlwaysOnTop(patch.alwaysOnTop);
    }
    if (patch.hotkey) {
      setupGlobalShortcut(patch.hotkey);
    }
    return updated;
  });

  ipcMain.handle(IPC_CHANNELS.OPEN_WORKSPACE, (_e, workspacePath: string) => {
    if (workspacePath) {
      shell.openPath(workspacePath);
    }
  });
}

function setupTray() {
  try {
    // 16x16 transparent dot as fallback tray icon
    const icon = nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZKAQMFKon2H4j6wB5GhkGI0GI2sApD1gYBhZk0fWAGpHA2U0k5A0AAAe3Qf5d9pIvgAAAABJRU5ErkJggg==',
        'base64'
      )
    );

    tray = new Tray(icon);
    tray.setToolTip('Agent Pop-Up (AgentDock)');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Agent Pop-Up',
        click: () => windowManager?.show(),
      },
      {
        label: 'Toggle Expand / Inbox',
        click: () => windowManager?.toggleExpand(),
      },
      { type: 'separator' },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: settingsStore?.get().alwaysOnTop ?? true,
        click: (item) => {
          windowManager?.setAlwaysOnTop(item.checked);
          settingsStore?.update({ alwaysOnTop: item.checked });
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      windowManager?.show();
    });
  } catch (err) {
    console.warn('Could not initialize system tray:', err);
  }
}

function setupGlobalShortcut(hotkeyStr?: string) {
  globalShortcut.unregisterAll();
  const shortcut = hotkeyStr || 'CommandOrControl+Shift+Space';
  try {
    globalShortcut.register(shortcut, () => {
      const win = windowManager?.getWindow();
      if (win?.isVisible()) {
        windowManager?.hide();
      } else {
        windowManager?.show();
      }
    });
  } catch (err) {
    console.warn('Failed to register global hotkey:', err);
  }
}

app.whenReady().then(initApp);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  ingestServer?.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
