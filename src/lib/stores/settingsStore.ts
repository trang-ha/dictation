import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface TestSettings {
  wordCount: number;
  pauseDuration: number; // in seconds
  selectedVoice: string;
  speechRate: number;
  speechPitch: number;
  language: string;
  lastUsed: Date;
}

function createSettingsStore() {
  const defaultSettings: TestSettings = {
    wordCount: 10,
    pauseDuration: 3,
    selectedVoice: '',
    speechRate: 1.0,
    speechPitch: 1.0,
    language: 'en',
    lastUsed: new Date(),
  };

  const { subscribe, set, update } = writable<TestSettings>(defaultSettings);

  return {
    subscribe,

    // Load settings from localStorage
    load: () => {
      if (browser) {
        const stored = localStorage.getItem('dictation-settings');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            set({
              ...defaultSettings,
              ...parsed,
              lastUsed: new Date(parsed.lastUsed || Date.now()),
            });
          } catch (e) {
            console.error('Failed to parse stored settings:', e);
          }
        }
      }
    },

    // Update word count
    setWordCount: (count: number) => {
      update((current) => {
        const newSettings = {
          ...current,
          wordCount: Math.max(1, Math.min(100, count)), // Limit between 1-100
          lastUsed: new Date(),
        };

        if (browser) {
          localStorage.setItem(
            'dictation-settings',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Update pause duration
    setPauseDuration: (duration: number) => {
      update((current) => {
        const newSettings = {
          ...current,
          pauseDuration: Math.max(0.5, Math.min(10, duration)), // Limit between 0.5-10 seconds
          lastUsed: new Date(),
        };

        if (browser) {
          localStorage.setItem(
            'dictation-settings',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Update selected voice
    setVoice: (voiceName: string) => {
      update((current) => {
        const newSettings = {
          ...current,
          selectedVoice: voiceName,
          lastUsed: new Date(),
        };

        if (browser) {
          localStorage.setItem(
            'dictation-settings',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Update speech rate
    setSpeechRate: (rate: number) => {
      update((current) => {
        const newSettings = {
          ...current,
          speechRate: Math.max(0.5, Math.min(2.0, rate)), // Limit between 0.5-2.0
          lastUsed: new Date(),
        };

        if (browser) {
          localStorage.setItem(
            'dictation-settings',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Update speech pitch
    setSpeechPitch: (pitch: number) => {
      update((current) => {
        const newSettings = {
          ...current,
          speechPitch: Math.max(0.5, Math.min(2.0, pitch)), // Limit between 0.5-2.0
          lastUsed: new Date(),
        };

        if (browser) {
          localStorage.setItem(
            'dictation-settings',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Update language
    setLanguage: (language: string) => {
      update((current) => {
        const newSettings = {
          ...current,
          language,
          selectedVoice: '', // Reset voice when language changes
          lastUsed: new Date(),
        };

        if (browser) {
          localStorage.setItem(
            'dictation-settings',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Update multiple settings at once
    updateSettings: (updates: Partial<TestSettings>) => {
      update((current) => {
        const newSettings = {
          ...current,
          ...updates,
          lastUsed: new Date(),
        };

        if (browser) {
          localStorage.setItem(
            'dictation-settings',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Reset to defaults
    reset: () => {
      const newSettings = {
        ...defaultSettings,
        lastUsed: new Date(),
      };

      set(newSettings);

      if (browser) {
        localStorage.setItem('dictation-settings', JSON.stringify(newSettings));
      }
    },
  };
}

export const settingsStore = createSettingsStore();
