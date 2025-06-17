import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface WordListData {
  words: string[];
  lastUpdated: Date;
  language: string;
}

export interface MultiLanguageWordData {
  en: WordListData;
  zh: WordListData;
  currentLanguage: string;
}

function createWordStore() {
  const defaultEnglishData: WordListData = {
    words: [],
    lastUpdated: new Date(),
    language: 'en',
  };

  const defaultChineseData: WordListData = {
    words: [],
    lastUpdated: new Date(),
    language: 'zh',
  };

  const defaultValue: MultiLanguageWordData = {
    en: defaultEnglishData,
    zh: defaultChineseData,
    currentLanguage: 'en',
  };

  const { subscribe, set, update } =
    writable<MultiLanguageWordData>(defaultValue);

  return {
    subscribe,

    // Load words from localStorage (migrate from old format if needed)
    load: () => {
      if (browser) {
        const stored = localStorage.getItem('dictation-words-multi');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            set({
              en: {
                words: parsed.en?.words || [],
                lastUpdated: new Date(parsed.en?.lastUpdated || Date.now()),
                language: 'en',
              },
              zh: {
                words: parsed.zh?.words || [],
                lastUpdated: new Date(parsed.zh?.lastUpdated || Date.now()),
                language: 'zh',
              },
              currentLanguage: parsed.currentLanguage || 'en',
            });
          } catch (e) {
            console.error('Failed to parse stored multi-language words:', e);
          }
        } else {
          // Try to migrate from old single-language format
          const oldStored = localStorage.getItem('dictation-words');
          if (oldStored) {
            try {
              const parsed = JSON.parse(oldStored);
              const migratedData: MultiLanguageWordData = {
                en: {
                  words: parsed.words || [],
                  lastUpdated: new Date(parsed.lastUpdated || Date.now()),
                  language: 'en',
                },
                zh: defaultChineseData,
                currentLanguage: 'en',
              };
              set(migratedData);

              // Save in new format
              localStorage.setItem(
                'dictation-words-multi',
                JSON.stringify(migratedData),
              );
              localStorage.removeItem('dictation-words'); // Clean up old format
            } catch (e) {
              console.error('Failed to migrate old word data:', e);
            }
          }
        }
      }
    },

    // Set current language
    setLanguage: (languageCode: string) => {
      update((current) => ({
        ...current,
        currentLanguage: languageCode,
      }));
    },

    // Get current language data
    getCurrentLanguageData: (): Promise<WordListData> => {
      return new Promise((resolve) => {
        const unsubscribe = subscribe((current) => {
          const langData =
            current.currentLanguage === 'zh' ? current.zh : current.en;
          resolve(langData);
          unsubscribe();
        });
      });
    },

    // Save words for current language
    saveWords: (words: string[], languageCode?: string) => {
      update((current) => {
        const targetLang = languageCode || current.currentLanguage;
        const newData = {
          words: words.filter((word) => word.trim().length > 0),
          lastUpdated: new Date(),
          language: targetLang,
        };

        const updated = {
          ...current,
          [targetLang]: newData,
        };

        if (browser) {
          localStorage.setItem(
            'dictation-words-multi',
            JSON.stringify(updated),
          );
        }

        return updated;
      });
    },

    // Add words from text input
    addWordsFromText: (text: string, languageCode?: string) => {
      const newWords = text
        .split(/[\n,;]/)
        .map((word) => word.trim())
        .filter((word) => word.length > 0);

      update((current) => {
        const targetLang = languageCode || current.currentLanguage;
        const currentLangData = targetLang === 'zh' ? current.zh : current.en;
        const combinedWords = [...currentLangData.words, ...newWords];
        const uniqueWords = [...new Set(combinedWords)]; // Remove duplicates

        const newData = {
          words: uniqueWords,
          lastUpdated: new Date(),
          language: targetLang,
        };

        const updated = {
          ...current,
          [targetLang]: newData,
        };

        if (browser) {
          localStorage.setItem(
            'dictation-words-multi',
            JSON.stringify(updated),
          );
        }

        return updated;
      });
    },

    // Remove a specific word
    removeWord: (wordToRemove: string, languageCode?: string) => {
      update((current) => {
        const targetLang = languageCode || current.currentLanguage;
        const currentLangData = targetLang === 'zh' ? current.zh : current.en;

        const newData = {
          words: currentLangData.words.filter((word) => word !== wordToRemove),
          lastUpdated: new Date(),
          language: targetLang,
        };

        const updated = {
          ...current,
          [targetLang]: newData,
        };

        if (browser) {
          localStorage.setItem(
            'dictation-words-multi',
            JSON.stringify(updated),
          );
        }

        return updated;
      });
    },

    // Clear all words for a language
    clear: (languageCode?: string) => {
      update((current) => {
        const targetLang = languageCode || current.currentLanguage;

        const newData: WordListData = {
          words: [],
          lastUpdated: new Date(),
          language: targetLang,
        };

        const updated = {
          ...current,
          [targetLang]: newData,
        };

        if (browser) {
          localStorage.setItem(
            'dictation-words-multi',
            JSON.stringify(updated),
          );
        }

        return updated;
      });
    },

    // Get random subset of words for current language
    getRandomWords: (
      count: number,
      languageCode?: string,
    ): Promise<string[]> => {
      return new Promise((resolve) => {
        const unsubscribe = subscribe((current) => {
          const targetLang = languageCode || current.currentLanguage;
          const langData = targetLang === 'zh' ? current.zh : current.en;

          if (langData.words.length === 0) {
            resolve([]);
            unsubscribe();
            return;
          }

          const shuffled = [...langData.words].sort(() => Math.random() - 0.5);
          resolve(shuffled.slice(0, Math.min(count, langData.words.length)));
          unsubscribe();
        });
      });
    },

    // Get sample words for a language
    getSampleWords: (languageCode: string): string[] => {
      if (languageCode === 'zh') {
        return [
          '你好',
          '谢谢',
          '再见',
          '请问',
          '对不起',
          '学习',
          '工作',
          '家庭',
          '朋友',
          '时间',
          '今天',
          '明天',
          '昨天',
          '上午',
          '下午',
          '吃饭',
          '睡觉',
          '起床',
          '洗澡',
          '刷牙',
          '中国',
          '北京',
          '上海',
          '广州',
          '深圳',
        ];
      } else {
        return [
          'hello',
          'world',
          'computer',
          'science',
          'technology',
          'education',
          'learning',
          'practice',
          'exercise',
          'vocabulary',
          'pronunciation',
          'listening',
          'speaking',
          'reading',
          'writing',
          'grammar',
          'dictionary',
          'language',
          'communication',
          'conversation',
        ];
      }
    },
  };
}

export const wordStore = createWordStore();
