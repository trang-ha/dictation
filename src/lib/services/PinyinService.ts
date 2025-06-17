import HanziWriter from 'hanzi-writer';
import pinyin from 'pinyin';

export interface PinyinData {
  original: string;
  pinyin: string;
  characters: CharacterData[];
}

export interface CharacterData {
  character: string;
  pinyin: string;
  isCharacter: boolean;
}

export interface StrokeOrderOptions {
  width: number;
  height: number;
  padding: number;
  showOutline: boolean;
  strokeAnimationSpeed: number;
  delayBetweenStrokes: number;
}

export class PinyinService {
  private defaultStrokeOptions: StrokeOrderOptions = {
    width: 150,
    height: 150,
    padding: 10,
    showOutline: true,
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 300,
  };

  /**
   * Convert Chinese text to pinyin with tone marks
   */
  convertToPinyin(text: string): PinyinData {
    if (!text || text.trim().length === 0) {
      return {
        original: text,
        pinyin: '',
        characters: [],
      };
    }

    try {
      // Convert to pinyin with tone marks
      const pinyinArray = pinyin(text, {
        heteronym: false, // Don't show multiple pronunciations
        segment: true, // Enable word segmentation
        style: pinyin.STYLE_TONE, // Use tone marks (ā, é, ǐ, ò, ü)
      });

      // Process each character/word
      const characters: CharacterData[] = [];
      let pinyinResult = '';

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const pinyinChar = pinyinArray[i] ? pinyinArray[i][0] : '';

        // Check if it's a Chinese character
        const isCharacter = this.isChineseCharacter(char);

        characters.push({
          character: char,
          pinyin: pinyinChar,
          isCharacter,
        });

        if (isCharacter && pinyinChar) {
          pinyinResult += pinyinChar + ' ';
        } else if (!isCharacter) {
          pinyinResult += char;
        }
      }

      return {
        original: text,
        pinyin: pinyinResult.trim(),
        characters,
      };
    } catch (error) {
      console.error('Error converting to pinyin:', error);
      return {
        original: text,
        pinyin: text,
        characters: [{ character: text, pinyin: text, isCharacter: false }],
      };
    }
  }

  /**
   * Check if a character is Chinese
   */
  private isChineseCharacter(char: string): boolean {
    const code = char.charCodeAt(0);
    // Unicode ranges for Chinese characters
    return (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
      (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
      (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
      (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
      (code >= 0x2b820 && code <= 0x2ceaf)
    ); // CJK Extension E
  }

  /**
   * Create interactive stroke order animation for a Chinese character
   */
  async createStrokeOrder(
    character: string,
    targetElement: HTMLElement,
    options?: Partial<StrokeOrderOptions>,
  ): Promise<HanziWriter | null> {
    if (!character || !this.isChineseCharacter(character)) {
      console.warn('Invalid character for stroke order:', character);
      return null;
    }

    const finalOptions = { ...this.defaultStrokeOptions, ...options };

    try {
      // Clear any existing content
      targetElement.innerHTML = '';

      const writer = HanziWriter.create(targetElement, character, {
        width: finalOptions.width,
        height: finalOptions.height,
        padding: finalOptions.padding,
        showOutline: finalOptions.showOutline,
        strokeAnimationSpeed: finalOptions.strokeAnimationSpeed,
        delayBetweenStrokes: finalOptions.delayBetweenStrokes,

        // Interactive features
        showCharacter: false, // Start with character hidden
        drawingColor: '#2563eb', // Blue color for drawing
        strokeColor: '#374151', // Gray color for strokes
        radicalColor: '#dc2626', // Red color for radicals

        // Enable interactions
        showHintAfterMisses: 2,
        highlightOnComplete: true,

        // Styling
        strokeWidth: 3,
        outlineWidth: 2,
        charColor: '#1f2937',

        // Animation options
        renderer: 'svg', // Use SVG renderer for better quality
      });

      // Add click handler to start animation
      targetElement.addEventListener('click', () => {
        this.animateStrokeOrder(writer);
      });

      // Add double-click handler to show character outline
      targetElement.addEventListener('dblclick', () => {
        writer.showCharacter();
      });

      return writer;
    } catch (error) {
      console.error(
        'Error creating stroke order for character:',
        character,
        error,
      );

      // Fallback: show character without stroke order
      targetElement.innerHTML = `
        <div style="
          width: ${finalOptions.width}px; 
          height: ${finalOptions.height}px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 48px; 
          font-family: serif;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          color: #374151;
        ">
          ${character}
        </div>
      `;
      return null;
    }
  }

  /**
   * Animate stroke order for a character
   */
  private animateStrokeOrder(writer: HanziWriter): void {
    writer.animateCharacter({
      onComplete: () => {
        console.log('Stroke order animation completed');
      },
    });
  }

  /**
   * Start quiz mode for stroke order practice
   */
  startStrokeOrderQuiz(writer: HanziWriter): void {
    if (!writer) return;

    writer.quiz({
      onMistake: (strokeData: any) => {
        console.log('Mistake made on stroke:', strokeData);
      },
      onCorrectStroke: (strokeData: any) => {
        console.log('Correct stroke:', strokeData);
      },
      onComplete: (summaryData: any) => {
        console.log('Quiz completed:', summaryData);
      },
    });
  }

  /**
   * Create multiple stroke order displays for a word
   */
  async createWordStrokeOrder(
    word: string,
    containerElement: HTMLElement,
    options?: Partial<StrokeOrderOptions>,
  ): Promise<HanziWriter[]> {
    const writers: HanziWriter[] = [];

    // Clear container
    containerElement.innerHTML = '';

    // Create individual character containers
    for (let i = 0; i < word.length; i++) {
      const char = word[i];

      if (this.isChineseCharacter(char)) {
        const charContainer = document.createElement('div');
        charContainer.className = 'stroke-order-character';
        charContainer.style.cssText = `
          display: inline-block;
          margin: 0 8px;
          text-align: center;
        `;

        // Add character label
        const label = document.createElement('div');
        label.textContent = char;
        label.style.cssText = `
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        `;
        charContainer.appendChild(label);

        // Add stroke order container
        const strokeContainer = document.createElement('div');
        charContainer.appendChild(strokeContainer);

        containerElement.appendChild(charContainer);

        // Create stroke order
        const writer = await this.createStrokeOrder(
          char,
          strokeContainer,
          options,
        );
        if (writer) {
          writers.push(writer);
        }
      }
    }

    return writers;
  }

  /**
   * Get sample Chinese words for testing
   */
  getSampleChineseWords(): string[] {
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
  }

  /**
   * Create enhanced pinyin display with tones
   */
  createPinyinDisplay(pinyinData: PinyinData): string {
    return pinyinData.characters
      .map((char) => {
        if (char.isCharacter) {
          return `${char.character}(${char.pinyin})`;
        }
        return char.character;
      })
      .join(' ');
  }
}

export const pinyinService = new PinyinService();
