export interface Settings {
  nodeType: 'full' | 'light';
  nodeUrl: string;
  networkType: 'bootstrap' | 'custom';
  customNetworkUrl: string;
  autoSelectNew: boolean;
  theme: 'light' | 'dark';
}

const SETTINGS_KEY = 'wakubase_settings';

export const defaultSettings: Settings = {
  nodeType: 'full',
  nodeUrl: 'http://127.0.0.1:8645',
  networkType: 'bootstrap',
  customNetworkUrl: '',
  autoSelectNew: true,
  theme: 'light',
};

type Listener<T> = (value: T) => void;

class BrowserSettingsStore {
  private listeners: Map<keyof Settings, Set<Listener<any>>> = new Map();

  constructor() {
    this.initializeSettings();
  }

  private initializeSettings(): void {
    try {
      const existingSettings = localStorage.getItem(SETTINGS_KEY);
      if (!existingSettings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }
  }

  private getSettings(): Settings {
    try {
      const settings = localStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : defaultSettings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return defaultSettings;
    }
  }

  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.getSettings()[key];
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    try {
      const settings = this.getSettings();
      settings[key] = value;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      
      // Notify listeners
      this.notifyListeners(key, value);
    } catch (error) {
      console.error(`Failed to set setting ${String(key)}:`, error);
    }
  }

  private notifyListeners<K extends keyof Settings>(key: K, value: Settings[K]): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(value);
        } catch (error) {
          console.error(`Failed to notify listener for ${String(key)}:`, error);
        }
      });
    }
  }

  onDidChange<K extends keyof Settings>(key: K, callback: Listener<Settings[K]>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    const keyListeners = this.listeners.get(key)!;
    keyListeners.add(callback);

    // Return unsubscribe function
    return () => {
      keyListeners.delete(callback);
      if (keyListeners.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  // Utility method to reset settings to defaults
  resetToDefaults(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      Object.keys(defaultSettings).forEach(key => {
        this.notifyListeners(key as keyof Settings, defaultSettings[key as keyof Settings]);
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }
}

export const settingsStore = new BrowserSettingsStore();

// Helper functions
export const getNodeUrl = () => settingsStore.get('nodeUrl');
export const getNodeType = () => settingsStore.get('nodeType');
export const getNetworkType = () => settingsStore.get('networkType');
export const getCustomNetworkUrl = () => settingsStore.get('customNetworkUrl');
export const getAutoSelectNew = () => settingsStore.get('autoSelectNew');
export const getTheme = () => settingsStore.get('theme');

export const updateSettings = (settings: Partial<Settings>) => {
  Object.entries(settings).forEach(([key, value]) => {
    settingsStore.set(key as keyof Settings, value);
  });
}; 