<script lang="ts">
  import { languageStore } from '$lib/stores/languageStore';
  import { speechService } from '$lib/services/SpeechService';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { onMount } from 'svelte';
  
  let currentLanguage = 'en';
  let availableLanguages = [];
  let supportedLanguages = [];
  
  // Subscribe to language store
  $: languageStore.subscribe(value => {
    currentLanguage = value.currentLanguage;
    availableLanguages = value.availableLanguages;
  });
  
  onMount(async () => {
    // Check which languages have voice support
    if (speechService.isServiceSupported()) {
      // Small delay to ensure voices are loaded
      setTimeout(() => {
        supportedLanguages = availableLanguages.filter(lang => 
          speechService.isLanguageSupported(lang.voicePrefix)
        );
      }, 200);
    }
  });
  
  function handleLanguageChange(event) {
    const target = event.target;
    const newLanguage = target.value;
    
    // Update language store
    languageStore.setLanguage(newLanguage);
    
    // Reset voice selection when language changes
    settingsStore.setVoice('');
    
    // Trigger custom event for parent components
    const languageEvent = new CustomEvent('languageChanged', {
      detail: { 
        oldLanguage: currentLanguage, 
        newLanguage,
        languageInfo: availableLanguages.find(l => l.code === newLanguage)
      }
    });
    
    document.dispatchEvent(languageEvent);
  }
  
  function getLanguageLabel(lang) {
    const voiceCount = speechService.getVoicesByLanguage(lang.voicePrefix).length;
    const supportIndicator = voiceCount > 0 ? '🔊' : '❌';
    return `${lang.nativeName} ${supportIndicator}`;
  }
</script>

<div class="language-selector">
  <label for="language-select" class="block text-sm font-medium text-gray-700 mb-2">
    {languageStore.translate('language.selector')}
  </label>
  
  <select
    id="language-select"
    bind:value={currentLanguage}
    on:change={handleLanguageChange}
    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
  >
    {#each availableLanguages as lang}
      <option value={lang.code}>
        {getLanguageLabel(lang)}
      </option>
    {/each}
  </select>
  
  <p class="text-xs text-gray-500 mt-1">
    🔊 = Voice supported, ❌ = No voice available
  </p>
  
  {#if currentLanguage === 'zh'}
    <div class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-center text-sm text-blue-800">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Chinese mode includes pinyin and interactive stroke order
      </div>
    </div>
  {/if}
</div>

<style>
  .language-selector {
    min-width: 200px;
  }
</style> 
