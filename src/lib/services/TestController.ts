import { writable } from 'svelte/store';
import { speechService } from './SpeechService';

export enum TestState {
  IDLE = 'idle',
  STARTING = 'starting',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface TestProgress {
  currentWordIndex: number;
  totalWords: number;
  currentWord: string;
  wordsCompleted: string[];
  timeRemaining: number;
  state: TestState;
  error?: string;
}

export interface TestConfiguration {
  words: string[];
  pauseDuration: number;
  voiceName?: string;
  speechRate?: number;
  speechPitch?: number;
}

function createTestController() {
  const initialProgress: TestProgress = {
    currentWordIndex: 0,
    totalWords: 0,
    currentWord: '',
    wordsCompleted: [],
    timeRemaining: 0,
    state: TestState.IDLE
  };

  const { subscribe, set, update } = writable<TestProgress>(initialProgress);

  let currentConfig: TestConfiguration | null = null;
  let pauseTimer: NodeJS.Timeout | null = null;
  let testPromiseResolver: ((value: string[]) => void) | null = null;
  let testPromiseRejecter: ((reason: any) => void) | null = null;

  const clearTimer = () => {
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
  };

  const updateProgress = (updates: Partial<TestProgress>) => {
    update(current => ({ ...current, ...updates }));
  };

  const speakNextWord = async (): Promise<void> => {
    if (!currentConfig) {
      throw new Error('No test configuration available');
    }

    return new Promise((resolve) => {
      const currentState = get(testController);
      
      if (currentState.currentWordIndex >= currentConfig.words.length) {
        // Test completed
        updateProgress({
          state: TestState.COMPLETED,
          timeRemaining: 0
        });
        
        if (testPromiseResolver) {
          testPromiseResolver(currentState.wordsCompleted);
          testPromiseResolver = null;
        }
        resolve();
        return;
      }

      const word = currentConfig.words[currentState.currentWordIndex];
      
      updateProgress({
        currentWord: word,
        state: TestState.RUNNING,
        timeRemaining: currentConfig.pauseDuration
      });

      // Speak the word
      speechService.speak(word, {
        voiceName: currentConfig.voiceName,
        rate: currentConfig.speechRate,
        pitch: currentConfig.speechPitch
      }).then(() => {
        // Add word to completed list
        const newCompleted = [...currentState.wordsCompleted, word];
        
        updateProgress({
          wordsCompleted: newCompleted,
          currentWordIndex: currentState.currentWordIndex + 1
        });

        // Start pause timer with countdown
        let timeLeft = currentConfig.pauseDuration;
        
        const countdown = () => {
          updateProgress({ timeRemaining: timeLeft });
          
          if (timeLeft <= 0) {
            speakNextWord().then(resolve);
          } else {
            timeLeft -= 0.1;
            pauseTimer = setTimeout(countdown, 100); // Update every 100ms for smooth countdown
          }
        };
        
        countdown();
        
      }).catch((error) => {
        updateProgress({
          state: TestState.ERROR,
          error: error.message
        });
        
        if (testPromiseRejecter) {
          testPromiseRejecter(error);
          testPromiseRejecter = null;
        }
        resolve();
      });
    });
  };

  // Helper function to get current state (needed for speakNextWord)
  const get = (store: any) => {
    let value: TestProgress;
    const unsubscribe = store.subscribe((v: TestProgress) => value = v);
    unsubscribe();
    return value!;
  };

  return {
    subscribe,

    // Start a new dictation test
    startTest: async (config: TestConfiguration): Promise<string[]> => {
      // Stop any current test
      testController.stopTest();

      if (!speechService.isServiceSupported()) {
        throw new Error('Speech synthesis is not supported on this device');
      }

      if (config.words.length === 0) {
        throw new Error('No words provided for dictation');
      }

      currentConfig = config;

      // Reset progress
      set({
        currentWordIndex: 0,
        totalWords: config.words.length,
        currentWord: '',
        wordsCompleted: [],
        timeRemaining: 0,
        state: TestState.STARTING
      });

      return new Promise((resolve, reject) => {
        testPromiseResolver = resolve;
        testPromiseRejecter = reject;

        // Small delay to let UI update
        setTimeout(() => {
          speakNextWord().catch(reject);
        }, 500);
      });
    },

    // Stop the current test
    stopTest: () => {
      clearTimer();
      speechService.stop();
      
      updateProgress({
        state: TestState.IDLE,
        timeRemaining: 0
      });

      currentConfig = null;
      testPromiseResolver = null;
      testPromiseRejecter = null;
    },

    // Pause the current test
    pauseTest: () => {
      clearTimer();
      speechService.pause();
      
      updateProgress({
        state: TestState.PAUSED
      });
    },

    // Resume the paused test
    resumeTest: () => {
      if (currentConfig) {
        speechService.resume();
        
        updateProgress({
          state: TestState.RUNNING
        });

        // Continue with the pause timer if we were in a pause
        const currentState = get(testController);
        if (currentState.timeRemaining > 0) {
          let timeLeft = currentState.timeRemaining;
          
          const countdown = () => {
            updateProgress({ timeRemaining: timeLeft });
            
            if (timeLeft <= 0) {
              speakNextWord();
            } else {
              timeLeft -= 0.1;
              pauseTimer = setTimeout(countdown, 100);
            }
          };
          
          countdown();
        }
      }
    },

    // Get the current test state
    getCurrentState: (): TestProgress => {
      return get(testController);
    },

    // Reset to initial state
    reset: () => {
      testController.stopTest();
      set(initialProgress);
    }
  };
}

export const testController = createTestController(); 