/**
 * Admin Settings Hook
 * React hook for managing admin settings throughout the application
 */

import { useState, useEffect, useCallback } from 'react';
import { adminSettingsService } from '../services/AdminSettingsService';
import { AdminSettings, SettingsValidationResult, SettingsChangeLog } from '../types/AdminSettingsTypes';

export interface UseAdminSettingsReturn {
  settings: AdminSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  changeLog: SettingsChangeLog[];
  loadSettings: () => Promise<void>;
  updateSetting: (
    category: keyof AdminSettings,
    key: string,
    value: any,
    changedBy?: string,
    reason?: string
  ) => Promise<SettingsValidationResult>;
  updateMultipleSettings: (
    updates: Array<{
      category: keyof AdminSettings;
      key: string;
      value: any;
    }>,
    changedBy?: string,
    reason?: string
  ) => Promise<SettingsValidationResult>;
  resetToDefaults: (changedBy?: string) => Promise<void>;
  exportSettings: () => string;
  importSettings: (jsonString: string, changedBy?: string) => Promise<SettingsValidationResult>;
  getSetting: (category: keyof AdminSettings, key: string) => any;
  getSettingsByCategory: (category: keyof AdminSettings) => any;
  loadChangeLog: () => Promise<void>;
  getSettingChangeLog: (settingId: string) => SettingsChangeLog[];
}

export const useAdminSettings = (): UseAdminSettingsReturn => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeLog, setChangeLog] = useState<SettingsChangeLog[]>([]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allSettings = adminSettingsService.getAllSettings();
      setSettings(allSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (
    category: keyof AdminSettings,
    key: string,
    value: any,
    changedBy: string = 'admin',
    reason?: string
  ): Promise<SettingsValidationResult> => {
    setSaving(true);
    setError(null);
    try {
      const result = adminSettingsService.updateSetting(category, key, value, changedBy, reason);
      if (result.isValid) {
        await loadSettings();
        await loadChangeLog();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update setting';
      setError(errorMessage);
      return {
        isValid: false,
        errors: { [key]: errorMessage }
      };
    } finally {
      setSaving(false);
    }
  }, [loadSettings]);

  const updateMultipleSettings = useCallback(async (
    updates: Array<{
      category: keyof AdminSettings;
      key: string;
      value: any;
    }>,
    changedBy: string = 'admin',
    reason?: string
  ): Promise<SettingsValidationResult> => {
    setSaving(true);
    setError(null);
    try {
      const result = adminSettingsService.updateMultipleSettings(updates, changedBy, reason);
      if (result.isValid) {
        await loadSettings();
        await loadChangeLog();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      return {
        isValid: false,
        errors: { multiple: errorMessage }
      };
    } finally {
      setSaving(false);
    }
  }, [loadSettings]);

  const resetToDefaults = useCallback(async (changedBy: string = 'admin') => {
    setSaving(true);
    setError(null);
    try {
      adminSettingsService.resetToDefaults(changedBy);
      await loadSettings();
      await loadChangeLog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  }, [loadSettings]);

  const exportSettings = useCallback(() => {
    try {
      return adminSettingsService.exportSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export settings');
      return '';
    }
  }, []);

  const importSettings = useCallback(async (
    jsonString: string,
    changedBy: string = 'admin'
  ): Promise<SettingsValidationResult> => {
    setSaving(true);
    setError(null);
    try {
      const result = adminSettingsService.importSettings(jsonString, changedBy);
      if (result.isValid) {
        await loadSettings();
        await loadChangeLog();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import settings';
      setError(errorMessage);
      return {
        isValid: false,
        errors: { import: errorMessage }
      };
    } finally {
      setSaving(false);
    }
  }, [loadSettings]);

  const getSetting = useCallback((category: keyof AdminSettings, key: string) => {
    return adminSettingsService.getSetting(category, key);
  }, []);

  const getSettingsByCategory = useCallback((category: keyof AdminSettings) => {
    return adminSettingsService.getSettingsByCategory(category);
  }, []);

  const loadChangeLog = useCallback(async () => {
    try {
      const log = adminSettingsService.getChangeLog();
      setChangeLog(log);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load change log');
    }
  }, []);

  const getSettingChangeLog = useCallback((settingId: string) => {
    return adminSettingsService.getSettingChangeLog(settingId);
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadChangeLog();
  }, [loadSettings, loadChangeLog]);

  return {
    settings,
    loading,
    saving,
    error,
    changeLog,
    loadSettings,
    updateSetting,
    updateMultipleSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    getSetting,
    getSettingsByCategory,
    loadChangeLog,
    getSettingChangeLog,
  };
};

export default useAdminSettings;