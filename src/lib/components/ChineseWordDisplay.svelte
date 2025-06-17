<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { pinyinService } from '$lib/services/PinyinService';
  import type { PinyinData } from '$lib/services/PinyinService';
  import HanziWriter from 'hanzi-writer';
  
  export let word: string = '';
  export let showPinyin: boolean = true;
  export let showStrokeOrder: boolean = true;
  export let interactive: boolean = true;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  
  let pinyinData: PinyinData | null = null;
  let strokeOrderContainer: HTMLDivElement;
  let writers: HanziWriter[] = [];
  let isLoading = false;
  let error = '';
  
  // Size configurations
  const sizeConfig = {
    small: { width: 80, height: 80, fontSize: '24px' },
    medium: { width: 120, height: 120, fontSize: '32px' },
    large: { width: 160, height: 160, fontSize: '48px' }
  };
  
  $: currentSize = sizeConfig[size];
  
  // Reactive statement to update when word changes
  $: if (word) {
    updateWordDisplay();
  }
  
  onMount(() => {
    if (word) {
      updateWordDisplay();
    }
  });
  
  onDestroy(() => {
    // Clear HanziWriter instances (they will be garbage collected)
    writers = [];
  });
  
  async function updateWordDisplay() {
    if (!word || word.trim().length === 0) {
      pinyinData = null;
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      // Convert to pinyin
      pinyinData = pinyinService.convertToPinyin(word);
      
      // Create stroke order display if needed
      if (showStrokeOrder && strokeOrderContainer) {
        await createStrokeOrderDisplay();
      }
    } catch (err) {
      console.error('Error updating word display:', err);
      error = 'Failed to process Chinese text';
    } finally {
      isLoading = false;
    }
  }
  
  async function createStrokeOrderDisplay() {
    if (!strokeOrderContainer || !pinyinData) return;
    
    // Clear existing writers (they will be garbage collected)
    writers = [];
    
    try {
      // Create stroke order for each Chinese character
      const newWriters = await pinyinService.createWordStrokeOrder(
        word,
        strokeOrderContainer,
        {
          width: currentSize.width,
          height: currentSize.height,
          padding: 8,
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 200
        }
      );
      
      writers = newWriters;
    } catch (err) {
      console.error('Error creating stroke order:', err);
      error = 'Failed to create stroke order display';
    }
  }
  
  function handleCharacterClick(writer: HanziWriter, character: string) {
    if (!interactive || !writer) return;
    
    // Start animation
    writer.animateCharacter({
      onComplete: () => {
        console.log(`Animation completed for character: ${character}`);
      }
    });
  }
  
  function handleQuizMode(writer: HanziWriter, character: string) {
    if (!interactive || !writer) return;
    
    // Start quiz mode
    pinyinService.startStrokeOrderQuiz(writer);
  }
  
  function getPinyinWithTones(character: string): string {
    if (!pinyinData) return '';
    
    const charData = pinyinData.characters.find(c => c.character === character);
    return charData ? charData.pinyin : '';
  }
</script>

<div class="chinese-word-display">
  {#if isLoading}
    <div class="loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Processing...</span>
    </div>
  {:else if error}
    <div class="error">
      <div class="text-red-600 text-sm">{error}</div>
    </div>
  {:else if pinyinData}
    <div class="word-container">
      <!-- Original Chinese characters -->
      <div class="chinese-text" style="font-size: {currentSize.fontSize}">
        {word}
      </div>
      
      <!-- Pinyin display -->
      {#if showPinyin}
        <div class="pinyin-text">
          {pinyinData.pinyin}
        </div>
      {/if}
      
      <!-- Character breakdown -->
      <div class="character-breakdown">
        {#each pinyinData.characters as char}
          {#if char.isCharacter}
            <div class="character-item">
              <div class="character">{char.character}</div>
              <div class="character-pinyin">{char.pinyin}</div>
            </div>
          {/if}
        {/each}
      </div>
      
      <!-- Stroke order display -->
      {#if showStrokeOrder}
        <div class="stroke-order-section">
          <h4 class="stroke-order-title">Interactive Stroke Order</h4>
          <div class="stroke-order-instructions">
            Click to animate • Double-click for quiz mode
          </div>
          <div 
            bind:this={strokeOrderContainer}
            class="stroke-order-container"
          ></div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .chinese-word-display {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    max-width: 100%;
  }
  
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .error {
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
  }
  
  .word-container {
    text-align: center;
  }
  
  .chinese-text {
    font-family: 'Noto Sans SC', 'Source Han Sans', serif;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }
  
  .pinyin-text {
    font-size: 1.125rem;
    color: #6b7280;
    margin-bottom: 1rem;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 0.05em;
  }
  
  .character-breakdown {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  
  .character-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    min-width: 60px;
  }
  
  .character {
    font-size: 1.5rem;
    font-weight: 500;
    color: #1f2937;
    font-family: 'Noto Sans SC', 'Source Han Sans', serif;
  }
  
  .character-pinyin {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
  
  .stroke-order-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .stroke-order-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .stroke-order-instructions {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }
  
  .stroke-order-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }
  
  /* Global styles for stroke order characters */
  :global(.stroke-order-character) {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  :global(.stroke-order-character:hover) {
    transform: scale(1.05);
  }
  
  :global(.stroke-order-character svg) {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: #fafafa;
  }
  
  :global(.stroke-order-character:hover svg) {
    border-color: #3b82f6;
    background: #f0f9ff;
  }
  
  /* Responsive design */
  @media (max-width: 640px) {
    .chinese-word-display {
      padding: 1rem;
    }
    
    .character-breakdown {
      gap: 0.5rem;
    }
    
    .stroke-order-container {
      gap: 0.5rem;
    }
  }
</style> 
