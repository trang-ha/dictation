<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { wordStore } from '$lib/stores/wordStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { languageStore } from '$lib/stores/languageStore';
	import { testController, TestState } from '$lib/services/TestController';
	import { speechService } from '$lib/services/SpeechService';
	import ChineseWordDisplay from '$lib/components/ChineseWordDisplay.svelte';
	
	let wordData = {
		en: { words: [], lastUpdated: new Date(), language: 'en' },
		zh: { words: [], lastUpdated: new Date(), language: 'zh' },
		currentLanguage: 'en'
	};
	let settings = {
		wordCount: 10,
		pauseDuration: 3,
		selectedVoice: '',
		speechRate: 1.0,
		speechPitch: 1.0,
		language: 'en',
		lastUsed: new Date()
	};
	let testProgress = {
		currentWordIndex: 0,
		totalWords: 0,
		currentWord: '',
		wordsCompleted: [],
		timeRemaining: 0,
		state: TestState.IDLE
	};
	let currentLanguage = { code: 'en', name: 'English', nativeName: 'English', voicePrefix: 'en' };
	let speechSupported = false;
	let availableVoices = [];
	let isLoading = false;
	let error = '';
	let testWords = [];

	// Subscribe to stores
	$: wordStore.subscribe(value => {
		wordData = value;
	});
	$: settingsStore.subscribe(value => {
		settings = value;
	});
	$: testController.subscribe(value => testProgress = value);
	$: languageStore.subscribe(value => {
		currentLanguage = value.availableLanguages.find(lang => lang.code === value.currentLanguage) || value.availableLanguages[0];
	});

	// Get current language word data
	$: currentWordData = getCurrentWordData();

	function getCurrentWordData() {
		return settings.language === 'zh' ? wordData.zh : wordData.en;
	}

	onMount(async () => {
		speechSupported = speechService.isServiceSupported();
		if (speechSupported) {
			// Small delay to let voices load
			setTimeout(() => {
				availableVoices = speechService.getAvailableVoices(settings.language);
			}, 100);
		}
	});

	async function startQuickTest() {
		const currentData = getCurrentWordData();
		if (currentData.words.length === 0) {
			error = languageStore.translate('home.noWords');
			return;
		}

		if (!speechSupported) {
			error = languageStore.translate('home.speechNotSupported');
			return;
		}

		error = '';
		isLoading = true;

		try {
			const selectedWords = await wordStore.getRandomWords(settings.wordCount, settings.language);
			testWords = selectedWords;
			
			const testConfig = {
				words: selectedWords,
				pauseDuration: settings.pauseDuration,
				voiceName: settings.selectedVoice,
				speechRate: settings.speechRate,
				speechPitch: settings.speechPitch
			};

			// Start the test
			const completedWords = await testController.startTest(testConfig);
			
			// Navigate to results page with the completed words
			goto(`/results?words=${encodeURIComponent(JSON.stringify(completedWords))}&lang=${settings.language}`);
		} catch (err) {
			error = `Test failed: ${String(err)}`;
		} finally {
			isLoading = false;
		}
	}

	function stopTest() {
		testController.stopTest();
	}

	function pauseTest() {
		if (testProgress.state === TestState.RUNNING) {
			testController.pauseTest();
		} else if (testProgress.state === TestState.PAUSED) {
			testController.resumeTest();
		}
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString();
	}

	function formatWordCount(count: number): string {
		return count === 1 ? '1 word' : `${count} words`;
	}

	// Listen for language change events
	onMount(() => {
		const handleLanguageChange = (event: CustomEvent) => {
			const { newLanguage } = event.detail;
			// Update available voices for the new language
			if (speechService.isServiceSupported()) {
				setTimeout(() => {
					availableVoices = speechService.getAvailableVoices(newLanguage);
				}, 100);
			}
		};

		document.addEventListener('languageChanged', handleLanguageChange as EventListener);
		
		return () => {
			document.removeEventListener('languageChanged', handleLanguageChange as EventListener);
		};
	});
</script>

<svelte:head>
	<title>{languageStore.translate('app.title')}</title>
	<meta name="description" content="{languageStore.translate('app.description')}" />
</svelte:head>

<div class="space-y-8">
	<!-- Hero Section -->
	<div class="text-center">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">
			{languageStore.translate('home.title')}
		</h1>
		<p class="text-lg text-gray-600 mb-8">
			{languageStore.translate('app.description')}
		</p>
	</div>

	<!-- Error Display -->
	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-md p-4">
			<div class="flex">
				<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
				<div class="ml-3">
					<p class="text-sm text-red-800">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="grid md:grid-cols-2 gap-6">
		<!-- Quick Test Card -->
		<div class="card">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900">{languageStore.translate('home.quickTest')}</h2>
				<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
					<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H9m0 0v1.5a.5.5 0 01.5.5H11a.5.5 0 01.5-.5V12a.5.5 0 01-.5-.5H9z" />
					</svg>
				</div>
			</div>
			
			<div class="space-y-4">
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Words available:</span>
					<span class="font-medium">{formatWordCount(currentWordData.words.length)}</span>
				</div>
				
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Test length:</span>
					<span class="font-medium">{formatWordCount(settings.wordCount)}</span>
				</div>
				
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Last updated:</span>
					<span class="font-medium">{formatDate(currentWordData.lastUpdated)}</span>
				</div>
				
				{#if currentWordData.words.length > 0}
					<button
						class="btn btn-primary w-full"
						on:click={startQuickTest}
						disabled={isLoading || testProgress.state !== TestState.IDLE}
					>
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Starting...
						{:else}
							{languageStore.translate('home.startTest')}
						{/if}
					</button>
				{:else}
					<div class="text-center py-4">
						<p class="text-gray-500 text-sm mb-3">{languageStore.translate('home.noWords')}</p>
						<a href="/setup" class="btn btn-secondary">
							Go to Setup
						</a>
					</div>
				{/if}
			</div>
		</div>

		<!-- Speech Support Card -->
		<div class="card">
			<div class="flex items-center justify-between mb-3">
				<h3 class="font-semibold text-gray-900">Speech Support</h3>
				<div class="w-8 h-8 {speechSupported ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center">
					{#if speechSupported}
						<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{:else}
						<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{/if}
				</div>
			</div>
			<div class="text-sm text-gray-600">
				{#if speechSupported}
					<div class="text-green-600 font-medium mb-1">✓ {languageStore.translate('speech.supported')}</div>
					<div>{availableVoices.length} {currentLanguage.nativeName} {languageStore.translate('speech.voicesAvailable')}</div>
				{:else}
					<div class="text-red-600 font-medium mb-1">✗ {languageStore.translate('speech.notSupported')}</div>
					<div>{languageStore.translate('speech.unavailable')}</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Current Test Status -->
	{#if testProgress.state !== TestState.IDLE}
		<div class="card bg-blue-50 border-blue-200">
			<h3 class="font-semibold text-blue-900 mb-4">{languageStore.translate('test.inProgress')}</h3>
			
			<div class="space-y-4">
				<div class="flex justify-between items-center">
					<span class="text-blue-700">{languageStore.translate('test.progress')}</span>
					<span class="font-medium text-blue-900">
						{testProgress.currentWordIndex} / {testProgress.totalWords}
					</span>
				</div>
				
				<div class="progress-bar">
					<div 
						class="progress-fill bg-blue-600" 
						style="width: {testProgress.totalWords > 0 ? (testProgress.currentWordIndex / testProgress.totalWords) * 100 : 0}%"
					></div>
				</div>
				
				{#if testProgress.currentWord}
					<div class="text-center py-4">
						{#if settings.language === 'zh'}
							<ChineseWordDisplay 
								word={testProgress.currentWord} 
								size="large"
								showPinyin={true}
								showStrokeOrder={true}
								interactive={true}
							/>
						{:else}
							<div class="text-3xl font-bold text-blue-900 mb-2">
								{testProgress.currentWord}
							</div>
						{/if}
					</div>
				{/if}
				
				{#if testProgress.timeRemaining > 0}
					<div class="text-center">
						<div class="text-lg font-mono text-blue-800">
							{testProgress.timeRemaining.toFixed(1)}s
						</div>
					</div>
				{/if}
				
				<div class="flex gap-2">
					<button
						class="btn btn-secondary flex-1"
						on:click={pauseTest}
						disabled={testProgress.state === TestState.STARTING}
					>
						{testProgress.state === TestState.PAUSED ? languageStore.translate('test.resume') : languageStore.translate('test.pause')}
					</button>
					<button
						class="btn btn-outline flex-1"
						on:click={stopTest}
					>
						{languageStore.translate('test.stop')}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Feature Preview for Chinese Mode -->
	{#if settings.language === 'zh' && testProgress.state === TestState.IDLE}
		<div class="card bg-yellow-50 border-yellow-200">
			<h3 class="font-semibold text-yellow-900 mb-4">Chinese Features Preview</h3>
			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<h4 class="font-medium text-yellow-800 mb-2">Sample Word with Pinyin:</h4>
					<ChineseWordDisplay 
						word="你好" 
						size="medium"
						showPinyin={true}
						showStrokeOrder={false}
						interactive={false}
					/>
				</div>
				<div>
					<h4 class="font-medium text-yellow-800 mb-2">Interactive Stroke Order:</h4>
					<ChineseWordDisplay 
						word="学" 
						size="medium"
						showPinyin={true}
						showStrokeOrder={true}
						interactive={true}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
		border: 1px solid #e5e7eb;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #2563eb;
	}

	.btn-secondary {
		background-color: #6b7280;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #4b5563;
	}

	.btn-outline {
		background-color: transparent;
		color: #6b7280;
		border-color: #d1d5db;
	}

	.btn-outline:hover:not(:disabled) {
		background-color: #f9fafb;
		border-color: #9ca3af;
	}

	.progress-bar {
		width: 100%;
		height: 0.5rem;
		background-color: #e5e7eb;
		border-radius: 0.25rem;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		transition: width 0.3s ease-in-out;
		border-radius: 0.25rem;
	}
</style> 
