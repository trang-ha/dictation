import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface WordListData {
  words: string[];
  lastUpdated: Date;
}

function createWordStore() {
  const defaultValue: WordListData = {
    words: [],
    lastUpdated: new Date()
  };

  const { subscribe, set, update } = writable<WordListData>(defaultValue);

  return {
    subscribe,
    
    // Load words from localStorage
    load: () => {
      if (browser) {
        const stored = localStorage.getItem('dictation-words');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            set({
              words: parsed.words || [],
              lastUpdated: new Date(parsed.lastUpdated || Date.now())
            });
          } catch (e) {
            console.error('Failed to parse stored words:', e);
          }
        }
      }
    },

    // Save words to localStorage and store
    saveWords: (words: string[]) => {
      const newData: WordListData = {
        words: words.filter(word => word.trim().length > 0),
        lastUpdated: new Date()
      };
      
      set(newData);
      
      if (browser) {
        localStorage.setItem('dictation-words', JSON.stringify(newData));
      }
    },

    // Add words from text input
    addWordsFromText: (text: string) => {
      const newWords = text
        .split(/[\n,;]/)
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      update(current => {
        const combinedWords = [...current.words, ...newWords];
        const uniqueWords = [...new Set(combinedWords)]; // Remove duplicates
        const newData = {
          words: uniqueWords,
          lastUpdated: new Date()
        };
        
        if (browser) {
          localStorage.setItem('dictation-words', JSON.stringify(newData));
        }
        
        return newData;
      });
    },

    // Remove a specific word
    removeWord: (wordToRemove: string) => {
      update(current => {
        const newData = {
          words: current.words.filter(word => word !== wordToRemove),
          lastUpdated: new Date()
        };
        
        if (browser) {
          localStorage.setItem('dictation-words', JSON.stringify(newData));
        }
        
        return newData;
      });
    },

    // Clear all words
    clear: () => {
      const newData: WordListData = {
        words: [],
        lastUpdated: new Date()
      };
      
      set(newData);
      
      if (browser) {
        localStorage.removeItem('dictation-words');
      }
    },

    // Get random subset of words
    getRandomWords: (count: number): Promise<string[]> => {
      return new Promise((resolve) => {
        const unsubscribe = subscribe(current => {
          if (current.words.length === 0) {
            resolve([]);
            unsubscribe();
            return;
          }
          
          const shuffled = [...current.words].sort(() => Math.random() - 0.5);
          resolve(shuffled.slice(0, Math.min(count, current.words.length)));
          unsubscribe();
        });
      });
    }
  };
}

export const wordStore = createWordStore(); 