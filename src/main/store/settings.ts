import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { AgentDockSettings, DEFAULT_SETTINGS } from '../../shared/types';

export class SettingsStore {
  private filePath: string;
  private settings: AgentDockSettings;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'settings.json');
    this.settings = this.load();
  }

  private load(): AgentDockSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('Failed to read settings file, using defaults:', err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public get(): AgentDockSettings {
    return { ...this.settings };
  }

  public update(patch: Partial<AgentDockSettings>): AgentDockSettings {
    this.settings = { ...this.settings, ...patch };
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save settings file:', err);
    }
    return this.settings;
  }
}
