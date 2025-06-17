import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  voicePrefix: string;
}

export interface LanguageSettings {
  currentLanguage: string;
  availableLanguages: Language[];
}

export interface Translation {
  [key: string]: string;
}

// Translation data
const translations: Record<string, Translation> = {
  en: {
    // App titles
    'app.title': 'English Dictation',
    'app.subtitle': 'Practice English listening skills',
    'app.description':
      'Perfect for students, learners, and language enthusiasts.',

    // Navigation
    'nav.home': 'Home',
    'nav.setup': 'Setup',
    'nav.results': 'Results',

    // Home page
    'home.title': 'Welcome to English Dictation',
    'home.quickTest': 'Quick Test',
    'home.startTest': 'Start Test',
    'home.noWords': 'Please add some words first in the Setup section.',
    'home.speechNotSupported':
      'Speech synthesis is not supported on this device.',

    // Setup page
    'setup.title': 'Setup - English Dictation',
    'setup.description':
      'Configure your word list and test settings for English dictation practice.',
    'setup.wordList': 'Word List',
    'setup.testSettings': 'Test Settings',
    'setup.speechSettings': 'Speech Settings',
    'setup.wordCount': 'Number of words per test',
    'setup.pauseDuration': 'Pause duration',
    'setup.voice': 'Voice',
    'setup.speechRate': 'Speech rate',
    'setup.speechPitch': 'Speech pitch',
    'setup.saveWords': 'Save Words',
    'setup.clearWords': 'Clear All Words',
    'setup.loadSample': 'Load Sample Words',
    'setup.testVoice': 'Test Voice',
    'setup.testing': 'Testing...',

    // Speech support
    'speech.supported': 'Supported',
    'speech.notSupported': 'Not supported',
    'speech.voicesAvailable': 'voices available',
    'speech.unavailable': 'Speech synthesis unavailable',

    // Test states
    'test.inProgress': 'Test in Progress',
    'test.progress': 'Progress:',
    'test.stop': 'Stop Test',
    'test.pause': 'Pause',
    'test.resume': 'Resume',
    'test.completed': 'Test Completed!',

    // Messages
    'msg.wordsSaved': 'words saved successfully!',
    'msg.wordsCleared': 'All words cleared.',
    'msg.voiceTestComplete': 'Voice test completed!',
    'msg.voiceTestFailed': 'Voice test failed:',
    'msg.selectVoiceFirst': 'Please select a voice first.',
    'msg.confirmClear': 'Are you sure you want to clear all words?',
    'msg.enterWords': 'Please enter at least one word.',

    // Language
    'language.selector': 'Language',
    'language.english': 'English',
    'language.chinese': 'Chinese',
  },
  zh: {
    // App titles
    'app.title': '英语听写',
    'app.subtitle': '练习英语听力技能',
    'app.description': '适合学生、学习者和语言爱好者使用。',

    // Navigation
    'nav.home': '首页',
    'nav.setup': '设置',
    'nav.results': '结果',

    // Home page
    'home.title': '欢迎使用中文听写',
    'home.quickTest': '快速测试',
    'home.startTest': '开始测试',
    'home.noWords': '请先在设置页面添加一些词汇。',
    'home.speechNotSupported': '此设备不支持语音合成。',

    // Setup page
    'setup.title': '设置 - 中文听写',
    'setup.description': '配置您的词汇表和中文听写练习测试设置。',
    'setup.wordList': '词汇表',
    'setup.testSettings': '测试设置',
    'setup.speechSettings': '语音设置',
    'setup.wordCount': '每次测试词汇数量',
    'setup.pauseDuration': '暂停时长',
    'setup.voice': '语音',
    'setup.speechRate': '语速',
    'setup.speechPitch': '音调',
    'setup.saveWords': '保存词汇',
    'setup.clearWords': '清空所有词汇',
    'setup.loadSample': '加载示例词汇',
    'setup.testVoice': '测试语音',
    'setup.testing': '测试中...',

    // Speech support
    'speech.supported': '支持',
    'speech.notSupported': '不支持',
    'speech.voicesAvailable': '个语音可用',
    'speech.unavailable': '语音合成不可用',

    // Test states
    'test.inProgress': '测试进行中',
    'test.progress': '进度：',
    'test.stop': '停止测试',
    'test.pause': '暂停',
    'test.resume': '继续',
    'test.completed': '测试完成！',

    // Messages
    'msg.wordsSaved': '个词汇保存成功！',
    'msg.wordsCleared': '所有词汇已清空。',
    'msg.voiceTestComplete': '语音测试完成！',
    'msg.voiceTestFailed': '语音测试失败：',
    'msg.selectVoiceFirst': '请先选择一个语音。',
    'msg.confirmClear': '您确定要清空所有词汇吗？',
    'msg.enterWords': '请至少输入一个词汇。',

    // Language
    'language.selector': '语言',
    'language.english': 'English',
    'language.chinese': '中文',
  },
};

function createLanguageStore() {
  const availableLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', voicePrefix: 'en' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', voicePrefix: 'zh' },
  ];

  const defaultSettings: LanguageSettings = {
    currentLanguage: 'en',
    availableLanguages,
  };

  const { subscribe, set, update } =
    writable<LanguageSettings>(defaultSettings);

  return {
    subscribe,

    // Load language settings from localStorage
    load: () => {
      if (browser) {
        const stored = localStorage.getItem('dictation-language');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            set({
              ...defaultSettings,
              currentLanguage: parsed.currentLanguage || 'en',
            });
          } catch (e) {
            console.error('Failed to parse stored language settings:', e);
          }
        }
      }
    },

    // Update current language
    setLanguage: (languageCode: string) => {
      update((current) => {
        const newSettings = {
          ...current,
          currentLanguage: languageCode,
        };

        if (browser) {
          localStorage.setItem(
            'dictation-language',
            JSON.stringify(newSettings),
          );
        }

        return newSettings;
      });
    },

    // Get translation for a key
    translate: (key: string, languageCode?: string): string => {
      let currentLang = 'en';

      // Get current language from store
      const unsubscribe = subscribe((current) => {
        currentLang = languageCode || current.currentLanguage;
      });
      unsubscribe();

      return (
        translations[currentLang]?.[key] || translations['en']?.[key] || key
      );
    },

    // Get current language info
    getCurrentLanguage: (): Language => {
      let currentInfo = availableLanguages[0];

      const unsubscribe = subscribe((current) => {
        currentInfo =
          availableLanguages.find(
            (lang) => lang.code === current.currentLanguage,
          ) || availableLanguages[0];
      });
      unsubscribe();

      return currentInfo;
    },

    // Check if current language is Chinese
    isChineseMode: (): boolean => {
      let isChinese = false;

      const unsubscribe = subscribe((current) => {
        isChinese = current.currentLanguage === 'zh';
      });
      unsubscribe();

      return isChinese;
    },
  };
}

export const languageStore = createLanguageStore();
