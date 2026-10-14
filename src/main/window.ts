import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import { AgentDockSettings, WindowViewMode } from '../shared/types';

export const ICON_SIZE = { width: 72, height: 72 };
export const PANEL_SIZE = { width: 420, height: 290 };
export const INBOX_SIZE = { width: 740, height: 560 };

export class WindowManager {
  private window: BrowserWindow | null = null;
  private currentMode: WindowViewMode = 'icon';
  private settings: AgentDockSettings;
  private iconAnchorPosition: { x: number; y: number } | null = null;

  constructor(settings: AgentDockSettings) {
    this.settings = settings;
  }

  public createWindow(): BrowserWindow {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    this.currentMode = 'icon';
    const initialSize = ICON_SIZE;

    // Clamp coordinates to primary display to prevent off-screen windows
    const primaryDisplay = screen.getPrimaryDisplay();
    const { workArea } = primaryDisplay;

    let posX = this.settings.windowPosition?.x ?? 24;
    let posY = this.settings.windowPosition?.y ?? 24;

    if (posX + initialSize.width > workArea.x + workArea.width) {
      posX = workArea.x + workArea.width - initialSize.width - 24;
    }
    if (posY + initialSize.height > workArea.y + workArea.height) {
      posY = workArea.y + workArea.height - initialSize.height - 24;
    }
    posX = Math.max(workArea.x + 12, posX);
    posY = Math.max(workArea.y + 12, posY);

    this.iconAnchorPosition = { x: posX, y: posY };

    this.window = new BrowserWindow({
      width: initialSize.width,
      height: initialSize.height,
      x: posX,
      y: posY,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: this.settings.alwaysOnTop,
      resizable: true,
      minWidth: 64,
      minHeight: 64,
      skipTaskbar: false,
      show: false,
      hasShadow: false, // We render our own smooth glassmorphic shadow in CSS
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    if (isDev) {
      this.window.loadURL('http://localhost:5173');
    } else {
      this.window.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.window.once('ready-to-show', () => {
      this.window?.show();
    });

    this.window.on('moved', () => {
      if (!this.window) return;
      const [x, y] = this.window.getPosition();
      if (this.currentMode === 'icon') {
        this.iconAnchorPosition = { x, y };
        this.settings.windowPosition = { x, y };
      }
    });

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public getMode(): WindowViewMode {
    return this.currentMode;
  }

  public setMode(targetMode: WindowViewMode): WindowViewMode {
    if (!this.window) return this.currentMode;
    this.currentMode = targetMode;

    let targetSize = ICON_SIZE;
    if (targetMode === 'panel') targetSize = PANEL_SIZE;
    if (targetMode === 'inbox') targetSize = INBOX_SIZE;

    const [currentX, currentY] = this.window.getPosition();
    const anchorX = this.iconAnchorPosition?.x ?? currentX;
    const anchorY = this.iconAnchorPosition?.y ?? currentY;

    // Smoothly animate resize
    this.window.setSize(targetSize.width, targetSize.height, true);

    const display = screen.getDisplayNearestPoint({ x: anchorX, y: anchorY });
    const { workArea } = display;

    let newX = anchorX;
    let newY = anchorY;

    if (newX + targetSize.width > workArea.x + workArea.width) {
      newX = workArea.x + workArea.width - targetSize.width - 16;
    }
    if (newY + targetSize.height > workArea.y + workArea.height) {
      newY = workArea.y + workArea.height - targetSize.height - 16;
    }

    newX = Math.max(workArea.x + 8, newX);
    newY = Math.max(workArea.y + 8, newY);

    this.window.setPosition(newX, newY, true);

    return this.currentMode;
  }

  public toggleExpand(forceExpand?: boolean): boolean {
    if (forceExpand === true) {
      this.setMode('panel');
      return true;
    } else if (forceExpand === false) {
      this.setMode('icon');
      return false;
    }

    if (this.currentMode === 'icon') {
      this.setMode('panel');
      return true;
    } else if (this.currentMode === 'panel') {
      this.setMode('inbox');
      return true;
    } else {
      this.setMode('icon');
      return false;
    }
  }

  public setAlwaysOnTop(alwaysOnTop: boolean): void {
    if (!this.window) return;
    this.window.setAlwaysOnTop(alwaysOnTop, 'floating');
    this.settings.alwaysOnTop = alwaysOnTop;
  }

  public minimize(): void {
    // For floating icon, minimizing collapses to icon mode first
    if (this.currentMode !== 'icon') {
      this.setMode('icon');
    } else {
      this.window?.minimize();
    }
  }

  public hide(): void {
    this.window?.hide();
  }

  public show(): void {
    if (!this.window) return;
    if (this.window.isMinimized()) {
      this.window.restore();
    }
    this.window.show();
    this.window.focus();
  }
}
