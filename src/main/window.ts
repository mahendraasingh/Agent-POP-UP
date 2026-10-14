import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import { AgentDockSettings } from '../shared/types';

export const COMPACT_SIZE = { width: 440, height: 280 };
export const EXPANDED_SIZE = { width: 740, height: 560 };

export class WindowManager {
  private window: BrowserWindow | null = null;
  private isExpanded: boolean = false;
  private settings: AgentDockSettings;

  constructor(settings: AgentDockSettings) {
    this.settings = settings;
  }

  public createWindow(): BrowserWindow {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const initialSize = this.settings.compactMode ? COMPACT_SIZE : EXPANDED_SIZE;
    this.isExpanded = !this.settings.compactMode;

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
      minWidth: 380,
      minHeight: 200,
      skipTaskbar: false,
      show: false,
      hasShadow: true,
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
      this.settings.windowPosition = { x, y };
    });

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public toggleExpand(forceExpand?: boolean): boolean {
    if (!this.window) return false;
    const targetState = forceExpand !== undefined ? forceExpand : !this.isExpanded;
    this.isExpanded = targetState;

    const [currentX, currentY] = this.window.getPosition();
    const targetSize = targetState ? EXPANDED_SIZE : COMPACT_SIZE;

    // Smoothly animate/resize
    this.window.setSize(targetSize.width, targetSize.height, true);
    
    // Ensure window stays within screen bounds when expanding
    const display = screen.getDisplayNearestPoint({ x: currentX, y: currentY });
    const { workArea } = display;

    let newX = currentX;
    let newY = currentY;

    if (newX + targetSize.width > workArea.x + workArea.width) {
      newX = workArea.x + workArea.width - targetSize.width - 16;
    }
    if (newY + targetSize.height > workArea.y + workArea.height) {
      newY = workArea.y + workArea.height - targetSize.height - 16;
    }

    if (newX !== currentX || newY !== currentY) {
      this.window.setPosition(Math.max(workArea.x, newX), Math.max(workArea.y, newY), true);
    }

    return this.isExpanded;
  }

  public setAlwaysOnTop(alwaysOnTop: boolean): void {
    if (!this.window) return;
    this.window.setAlwaysOnTop(alwaysOnTop, 'floating');
    this.settings.alwaysOnTop = alwaysOnTop;
  }

  public minimize(): void {
    this.window?.minimize();
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
