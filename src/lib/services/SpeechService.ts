export interface VoiceOption {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export class SpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();

      // Handle voice loading for different browsers
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
  }

  public isServiceSupported(): boolean {
    return this.isSupported;
  }

  public getAvailableVoices(languageFilter?: string): VoiceOption[] {
    if (!this.isSupported) return [];

    // Ensure voices are loaded
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    // Default to English if no filter specified
    const filterLang = languageFilter || 'en';

    return this.voices
      .filter((voice) => voice.lang.startsWith(filterLang))
      .map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default,
      }))
      .sort((a, b) => {
        // Prioritize local voices and default voices
        if (a.localService && !b.localService) return -1;
        if (!a.localService && b.localService) return 1;
        if (a.default && !b.default) return -1;
        if (!a.default && b.default) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  public getPreferredVoice(languageFilter?: string): VoiceOption | null {
    const voices = this.getAvailableVoices(languageFilter);
    if (voices.length === 0) return null;

    // Try to find a natural-sounding voice for the specified language
    const preferred =
      voices.find(
        (voice) =>
          voice.localService &&
          (voice.name.toLowerCase().includes('natural') ||
            voice.name.toLowerCase().includes('enhanced') ||
            voice.name.toLowerCase().includes('premium')),
      ) ||
      voices.find((voice) => voice.localService) ||
      voices[0];

    return preferred;
  }

  public async speak(
    text: string,
    options: {
      voiceName?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
    } = {},
  ): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Speech synthesis not supported');
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Find the specified voice or use default
      if (options.voiceName) {
        const voice = this.voices.find((v) => v.name === options.voiceName);
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        // Use preferred voice if no voice specified
        const preferredVoice = this.getPreferredVoice();
        if (preferredVoice) {
          const voice = this.voices.find((v) => v.name === preferredVoice.name);
          if (voice) {
            utterance.voice = voice;
          }
        }
      }

      // Set speech parameters
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Set up event handlers
      utterance.onend = () => resolve();
      utterance.onerror = (event) =>
        reject(new Error(`Speech error: ${event.error}`));

      // Start speaking
      this.synth.speak(utterance);
    });
  }

  public stop(): void {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }

  public pause(): void {
    if (this.isSupported) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.isSupported) {
      this.synth.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.isSupported && this.synth.speaking;
  }

  public isPaused(): boolean {
    return this.isSupported && this.synth.paused;
  }

  // Test speech with a sample word (language-specific)
  public async testVoice(
    voiceName: string,
    languageCode?: string,
  ): Promise<void> {
    const testText =
      languageCode === 'zh' ? '你好，这是一个测试。' : 'Hello, this is a test.';
    await this.speak(testText, { voiceName });
  }

  // Get voices for a specific language
  public getVoicesByLanguage(languageCode: string): VoiceOption[] {
    return this.getAvailableVoices(languageCode);
  }

  // Check if language is supported
  public isLanguageSupported(languageCode: string): boolean {
    return this.getVoicesByLanguage(languageCode).length > 0;
  }
}

export const speechService = new SpeechService();
