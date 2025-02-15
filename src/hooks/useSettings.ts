import { useState, useEffect } from 'react';
import { settingsStore, updateSettings as updateStoreSettings, getNodeUrl, getNodeType, getNetworkType, getCustomNetworkUrl, getAutoSelectNew, getTheme, defaultSettings } from '@/store/settings';

export interface Settings {
  nodeType: 'full' | 'light';
  nodeUrl: string;
  networkType: 'bootstrap' | 'custom';
  customNetworkUrl: string;
  autoSelectNew: boolean;
  theme: 'light' | 'dark';
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    nodeType: getNodeType(),
    nodeUrl: getNodeUrl(),
    networkType: getNetworkType(),
    customNetworkUrl: getCustomNetworkUrl(),
    autoSelectNew: getAutoSelectNew(),
    theme: getTheme(),
  });

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribeCallbacks = [
      settingsStore.onDidChange('nodeType', (newValue) => {
        setSettings(prev => ({ ...prev, nodeType: newValue as 'full' | 'light' }));
      }),
      settingsStore.onDidChange('nodeUrl', (newValue) => {
        setSettings(prev => ({ ...prev, nodeUrl: newValue as string }));
      }),
      settingsStore.onDidChange('networkType', (newValue) => {
        setSettings(prev => ({ ...prev, networkType: newValue as 'bootstrap' | 'custom' }));
      }),
      settingsStore.onDidChange('customNetworkUrl', (newValue) => {
        setSettings(prev => ({ ...prev, customNetworkUrl: newValue as string }));
      }),
      settingsStore.onDidChange('autoSelectNew', (newValue) => {
        setSettings(prev => ({ ...prev, autoSelectNew: newValue as boolean }));
      }),
      settingsStore.onDidChange('theme', (newValue) => {
        setSettings(prev => ({ ...prev, theme: newValue as 'light' | 'dark' }));
      }),
    ];

    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    updateStoreSettings(newSettings);
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    ...settings,
    updateSettings,
    defaultSettings,
  };
}; 