import { useState, useEffect, useCallback } from 'react';

export interface AlertThresholds {
  floodSensitivity: number;
  droughtIndex: number;
  conflictThreshold: number;
}

export interface NotificationChannels {
  smsAlerts: boolean;
  whatsappAlerts: boolean;
  emailDigest: boolean;
  pushNotifications: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'degraded';
  lastSync: string;
  lastSyncTimestamp: number;
}

export interface SystemSettings {
  thresholds: AlertThresholds;
  notifications: NotificationChannels;
}

const SETTINGS_STORAGE_KEY = 'hydrosentry_settings';

const defaultSettings: SystemSettings = {
  thresholds: {
    floodSensitivity: 70,
    droughtIndex: 65,
    conflictThreshold: 80,
  },
  notifications: {
    smsAlerts: true,
    whatsappAlerts: true,
    emailDigest: false,
    pushNotifications: true,
  },
};

// Simulated data sources with dynamic sync times
const createDataSources = (): DataSource[] => {
  const now = Date.now();
  return [
    {
      id: 'sentinel-1',
      name: 'Sentinel-1 SAR',
      description: 'Flood extent mapping via radar imagery',
      status: 'online',
      lastSync: '2 min ago',
      lastSyncTimestamp: now - 2 * 60 * 1000,
    },
    {
      id: 'odk-server',
      name: 'Warden Field Sync Engine',
      description: 'Asynchronous field reports from Guild Wardens',
      status: 'online',
      lastSync: '15 min ago',
      lastSyncTimestamp: now - 15 * 60 * 1000,
    },
    {
      id: 'openweather',
      name: 'OpenWeather API',
      description: 'Real-time precipitation forecasts',
      status: 'online',
      lastSync: '5 min ago',
      lastSyncTimestamp: now - 5 * 60 * 1000,
    },
    {
      id: 'fews-net',
      name: 'FEWS NET',
      description: 'Famine early warning indicators',
      status: 'online',
      lastSync: '1 hour ago',
      lastSyncTimestamp: now - 60 * 60 * 1000,
    },
  ];
};

// Format relative time
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
};

export function useSettings() {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<SystemSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return defaultSettings;
  });

  const [dataSources, setDataSources] = useState<DataSource[]>(createDataSources);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update data source sync times periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDataSources(prev => prev.map(source => ({
        ...source,
        lastSync: formatRelativeTime(source.lastSyncTimestamp),
      })));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Track unsaved changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const savedSettings = JSON.parse(stored);
        setHasUnsavedChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings));
      } else {
        setHasUnsavedChanges(JSON.stringify(settings) !== JSON.stringify(defaultSettings));
      }
    } catch {
      setHasUnsavedChanges(true);
    }
  }, [settings]);

  // Update threshold
  const updateThreshold = useCallback((key: keyof AlertThresholds, value: number) => {
    setSettings(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: value,
      },
    }));
  }, []);

  // Update notification channel
  const updateNotification = useCallback((key: keyof NotificationChannels, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setHasUnsavedChanges(false);
      return { success: true };
    } catch (e) {
      console.error('Failed to save settings:', e);
      return { success: false, error: 'Failed to save settings' };
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Simulate data source refresh
  const refreshDataSource = useCallback((sourceId: string) => {
    setDataSources(prev => prev.map(source => 
      source.id === sourceId
        ? { 
            ...source, 
            lastSync: 'Just now',
            lastSyncTimestamp: Date.now(),
            status: 'online' as const,
          }
        : source
    ));
  }, []);

  // Simulate all sources refresh
  const refreshAllSources = useCallback(() => {
    const now = Date.now();
    setDataSources(prev => prev.map(source => ({
      ...source,
      lastSync: 'Just now',
      lastSyncTimestamp: now,
      status: 'online' as const,
    })));
  }, []);

  return {
    settings,
    dataSources,
    isSaving,
    hasUnsavedChanges,
    updateThreshold,
    updateNotification,
    saveSettings,
    resetToDefaults,
    refreshDataSource,
    refreshAllSources,
  };
}
