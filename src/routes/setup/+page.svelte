<script lang="ts">
	import { onMount } from 'svelte';
	import { wordStore } from '$lib/stores/wordStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { languageStore } from '$lib/stores/languageStore';
	import { speechService } from '$lib/services/SpeechService';
	import type { MultiLanguageWordData } from '$lib/stores/wordStore';
	import type { TestSettings } from '$lib/stores/settingsStore';
	import type { VoiceOption } from '$lib/services/SpeechService';
	import ChineseWordDisplay from '$lib/components/ChineseWordDisplay.svelte';
	
	let wordData: MultiLanguageWordData = {
		en: { words: [], lastUpdated: new Date(), language: 'en' },
		zh: { words: [], lastUpdated: new Date(), language: 'zh' },
		currentLanguage: 'en'
	};
	let settings: TestSettings = {
		wordCount: 10,
		pauseDuration: 3,
		selectedVoice: '',
		speechRate: 1.0,
		speechPitch: 1.0,
		language: 'en',
		lastUsed: new Date()
	};
	let availableVoices: VoiceOption[] = [];
	let wordInput = '';
	let isTestingVoice = false;
	let saveMessage = '';
	let saveMessageType = 'success';

	// Subscribe to stores
	$: wordStore.subscribe(value => {
		wordData = value;
		const currentWords = getCurrentWordData().words;
		wordInput = currentWords.join('\n');
	});
	$: settingsStore.subscribe(value => {
		settings = value;
		// Update available voices when language changes
		if (speechService.isServiceSupported()) {
			setTimeout(() => {
				availableVoices = speechService.getAvailableVoices(value.language);
			}, 100);
		}
	});
	
	// Get current language word data
	function getCurrentWordData() {
		return settings.language === 'zh' ? wordData.zh : wordData.en;
	}

	onMount(() => {
		// Load available voices
		if (speechService.isServiceSupported()) {
			setTimeout(() => {
				availableVoices = speechService.getAvailableVoices();
				
				// Auto-select preferred voice if none selected
				if (!settings.selectedVoice && availableVoices.length > 0) {
					const preferred = speechService.getPreferredVoice();
					if (preferred) {
						settingsStore.setVoice(preferred.name);
					}
				}
			}, 100);
		}
	});

	function saveWords() {
		try {
			const words = wordInput
				.split('\n')
				.map(word => word.trim())
				.filter(word => word.length > 0);
			
			if (words.length === 0) {
				showSaveMessage('Please enter at least one word.', 'error');
				return;
			}

			wordStore.saveWords(words, settings.language);
			showSaveMessage(`Saved ${words.length} words successfully!`, 'success');
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			showSaveMessage('Failed to save words: ' + errorMessage, 'error');
		}
	}

	function clearWords() {
		if (confirm('Are you sure you want to clear all words?')) {
			wordStore.clear(settings.language);
			wordInput = '';
			showSaveMessage('All words cleared.', 'success');
		}
	}

	function showSaveMessage(message, type = 'success') {
		saveMessage = message;
		saveMessageType = type;
		setTimeout(() => {
			saveMessage = '';
		}, 3000);
	}

	async function testVoice() {
		if (!settings.selectedVoice) {
			showSaveMessage('Please select a voice first.', 'error');
			return;
		}

		isTestingVoice = true;
		try {
			await speechService.testVoice(settings.selectedVoice);
			showSaveMessage('Voice test completed!', 'success');
		} catch (error) {
			showSaveMessage('Voice test failed: ' + error.message, 'error');
		} finally {
			isTestingVoice = false;
		}
	}

	function updateWordCount(event) {
		const value = parseInt(event.target.value);
		settingsStore.setWordCount(value);
	}

	function updatePauseDuration(event) {
		const value = parseFloat(event.target.value);
		settingsStore.setPauseDuration(value);
	}

	function updateVoice(event) {
		settingsStore.setVoice(event.target.value);
	}

	function updateSpeechRate(event) {
		const value = parseFloat(event.target.value);
		settingsStore.setSpeechRate(value);
	}

	function updateSpeechPitch(event) {
		const value = parseFloat(event.target.value);
		settingsStore.setSpeechPitch(value);
	}

	function loadSampleWords() {
		const sampleWords = [
			'hello', 'world', 'computer', 'science', 'technology',
			'education', 'learning', 'practice', 'exercise', 'vocabulary',
			'pronunciation', 'listening', 'speaking', 'reading', 'writing',
			'grammar', 'dictionary', 'language', 'communication', 'conversation'
		];
		
		wordInput = sampleWords.join('\n');
		saveWords();
	}
</script>

<svelte:head>
	<title>Setup - English Dictation</title>
	<meta name="description" content="Configure your word list and test settings for English dictation practice." />
</svelte:head>

<div class="space-y-8">
	<div class="text-center">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Setup</h1>
		<p class="text-gray-600">Configure your word list and test settings</p>
	</div>

	<!-- Save Message Display -->
	{#if saveMessage}
		<div class="bg-{saveMessageType === 'success' ? 'green' : 'red'}-50 border border-{saveMessageType === 'success' ? 'green' : 'red'}-200 rounded-lg p-4 fade-in">
			<div class="flex items-center">
				<svg class="w-5 h-5 text-{saveMessageType === 'success' ? 'green' : 'red'}-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if saveMessageType === 'success'}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					{/if}
				</svg>
				<span class="text-{saveMessageType === 'success' ? 'green' : 'red'}-700">{saveMessage}</span>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Word List Section -->
		<div class="card">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900">Word List</h2>
				<div class="text-sm text-gray-500">
					{getCurrentWordData().words.length} words
				</div>
			</div>

			<div class="space-y-4">
				<div>
					<label for="wordInput" class="block text-sm font-medium text-gray-700 mb-2">
						Enter words (one per line)
					</label>
					<textarea
						id="wordInput"
						class="textarea"
						bind:value={wordInput}
						placeholder="Enter words here, one per line&#10;Example:&#10;hello&#10;world&#10;computer&#10;science"
						rows="10"
					></textarea>
					<p class="text-xs text-gray-500 mt-1">
						Tip: You can also separate words with commas or semicolons
					</p>
				</div>

				<div class="flex flex-wrap gap-2">
					<button class="btn btn-primary" on:click={saveWords}>
						💾 Save Words
					</button>
					
					<button class="btn btn-secondary" on:click={clearWords}>
						🗑️ Clear All
					</button>
					
					<button class="btn btn-secondary" on:click={loadSampleWords}>
						📝 Load Sample Words
					</button>
				</div>

				{#if getCurrentWordData().words.length > 0}
					<div class="mt-4">
						<h3 class="text-sm font-medium text-gray-700 mb-2">Current Words:</h3>
						<div class="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
							<div class="flex flex-wrap gap-1">
								{#each getCurrentWordData().words as word, index}
									<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
										{word}
									</span>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Settings Section -->
		<div class="card">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Test Settings</h2>

			<div class="space-y-6">
				<!-- Word Count -->
				<div>
					<label for="wordCount" class="block text-sm font-medium text-gray-700 mb-2">
						Words per test: {settings.wordCount}
					</label>
					<input
						id="wordCount"
						type="range"
						min="1"
						max="50"
						value={settings.wordCount}
						on:input={updateWordCount}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
					/>
					<div class="flex justify-between text-xs text-gray-500 mt-1">
						<span>1</span>
						<span>50</span>
					</div>
				</div>

				<!-- Pause Duration -->
				<div>
					<label for="pauseDuration" class="block text-sm font-medium text-gray-700 mb-2">
						Pause between words: {settings.pauseDuration}s
					</label>
					<input
						id="pauseDuration"
						type="range"
						min="0.5"
						max="10"
						step="0.5"
						value={settings.pauseDuration}
						on:input={updatePauseDuration}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
					/>
					<div class="flex justify-between text-xs text-gray-500 mt-1">
						<span>0.5s</span>
						<span>10s</span>
					</div>
				</div>

				<!-- Voice Selection -->
				<div>
					<label for="voiceSelect" class="block text-sm font-medium text-gray-700 mb-2">
						Voice
					</label>
					<select
						id="voiceSelect"
						value={settings.selectedVoice}
						on:change={updateVoice}
						class="input"
					>
						<option value="">Auto-select best voice</option>
						{#each availableVoices as voice}
							<option value={voice.name}>
								{voice.name} ({voice.lang}) {voice.localService ? '🔊' : '🌐'}
							</option>
						{/each}
					</select>
					<p class="text-xs text-gray-500 mt-1">
						🔊 = Local voice (better quality), 🌐 = Online voice
					</p>
					
					{#if settings.selectedVoice}
						<button
							class="btn btn-sm btn-secondary mt-2"
							on:click={testVoice}
							disabled={isTestingVoice}
						>
							{#if isTestingVoice}
								🔊 Testing...
							{:else}
								🔊 Test Voice
							{/if}
						</button>
					{/if}
				</div>

				<!-- Speech Rate -->
				<div>
					<label for="speechRate" class="block text-sm font-medium text-gray-700 mb-2">
						Speech rate: {settings.speechRate}x
					</label>
					<input
						id="speechRate"
						type="range"
						min="0.5"
						max="2.0"
						step="0.1"
						value={settings.speechRate}
						on:input={updateSpeechRate}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
					/>
					<div class="flex justify-between text-xs text-gray-500 mt-1">
						<span>0.5x (slow)</span>
						<span>2.0x (fast)</span>
					</div>
				</div>

				<!-- Speech Pitch -->
				<div>
					<label for="speechPitch" class="block text-sm font-medium text-gray-700 mb-2">
						Speech pitch: {settings.speechPitch}x
					</label>
					<input
						id="speechPitch"
						type="range"
						min="0.5"
						max="2.0"
						step="0.1"
						value={settings.speechPitch}
						on:input={updateSpeechPitch}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
					/>
					<div class="flex justify-between text-xs text-gray-500 mt-1">
						<span>0.5x (low)</span>
						<span>2.0x (high)</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="flex justify-center">
		<a href="/" class="btn btn-primary btn-lg">
			🏠 Back to Home
		</a>
	</div>
</div> 
