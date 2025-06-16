<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { wordStore } from '$lib/stores/wordStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { testController, TestState } from '$lib/services/TestController';
	import { speechService } from '$lib/services/SpeechService';
	
	let wordData = { words: [], lastUpdated: new Date() };
	let settings = { wordCount: 10, pauseDuration: 3, selectedVoice: '', speechRate: 1.0, speechPitch: 1.0, lastUsed: new Date() };
	let testProgress = { currentWordIndex: 0, totalWords: 0, currentWord: '', wordsCompleted: [], timeRemaining: 0, state: TestState.IDLE };
	let speechSupported = false;
	let availableVoices = [];
	let isLoading = false;
	let error = '';

	// Subscribe to stores
	$: wordStore.subscribe(value => wordData = value);
	$: settingsStore.subscribe(value => settings = value);
	$: testController.subscribe(value => testProgress = value);

	onMount(async () => {
		speechSupported = speechService.isServiceSupported();
		if (speechSupported) {
			// Small delay to let voices load
			setTimeout(() => {
				availableVoices = speechService.getAvailableVoices();
			}, 100);
		}
	});

	async function startQuickTest() {
		if (wordData.words.length === 0) {
			error = 'Please add some words first in the Setup section.';
			return;
		}

		if (!speechSupported) {
			error = 'Speech synthesis is not supported on this device.';
			return;
		}

		error = '';
		isLoading = true;

		try {
			const selectedWords = await wordStore.getRandomWords(settings.wordCount);
			
			const testConfig = {
				words: selectedWords,
				pauseDuration: settings.pauseDuration,
				voiceName: settings.selectedVoice,
				speechRate: settings.speechRate,
				speechPitch: settings.speechPitch
			};

			const results = await testController.startTest(testConfig);
			
			// Navigate to results page with the results
			goto(`/results?words=${encodeURIComponent(JSON.stringify(results))}`);
		} catch (err) {
			error = err.message || 'Failed to start test';
		} finally {
			isLoading = false;
		}
	}

	function stopTest() {
		testController.stopTest();
	}

	function formatLastUpdated(date) {
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>English Dictation - Practice English Listening</title>
	<meta name="description" content="Practice English listening skills with customizable word lists and natural voice synthesis." />
</svelte:head>

<div class="space-y-8">
	<!-- Hero Section -->
	<div class="text-center">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">
			English Dictation Practice
		</h1>
		<p class="text-xl text-gray-600 max-w-2xl mx-auto">
			Improve your English listening skills with customizable word lists and natural voice synthesis.
			Perfect for students, learners, and language enthusiasts.
		</p>
	</div>

	<!-- Status Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Word List Status -->
		<div class="card">
			<div class="flex items-center justify-between mb-3">
				<h3 class="font-semibold text-gray-900">Word List</h3>
				<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
					<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
			</div>
			<div class="text-2xl font-bold text-gray-900 mb-1">
				{wordData.words.length}
			</div>
			<div class="text-sm text-gray-500">
				{#if wordData.words.length > 0}
					Last updated: {formatLastUpdated(wordData.lastUpdated)}
				{:else}
					No words added yet
				{/if}
			</div>
		</div>

		<!-- Test Settings -->
		<div class="card">
			<div class="flex items-center justify-between mb-3">
				<h3 class="font-semibold text-gray-900">Test Settings</h3>
				<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
					<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
			</div>
			<div class="text-sm text-gray-600 space-y-1">
				<div>Words per test: <span class="font-medium">{settings.wordCount}</span></div>
				<div>Pause duration: <span class="font-medium">{settings.pauseDuration}s</span></div>
				<div>Voice: <span class="font-medium">
					{settings.selectedVoice || 'Auto-select'}
				</span></div>
			</div>
		</div>

		<!-- Speech Support -->
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
					<div class="text-green-600 font-medium mb-1">✓ Supported</div>
					<div>{availableVoices.length} English voices available</div>
				{:else}
					<div class="text-red-600 font-medium mb-1">✗ Not supported</div>
					<div>Speech synthesis unavailable</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Current Test Status -->
	{#if testProgress.state !== TestState.IDLE}
		<div class="card bg-blue-50 border-blue-200">
			<h3 class="font-semibold text-blue-900 mb-4">Test in Progress</h3>
			
			<div class="space-y-4">
				<div class="flex justify-between items-center">
					<span class="text-blue-700">Progress:</span>
					<span class="font-medium text-blue-900">
						{testProgress.currentWordIndex} / {testProgress.totalWords}
					</span>
				</div>
				
				<div class="progress-bar">
					<div 
						class="progress-fill bg-blue-600" 
						style="width: {(testProgress.currentWordIndex / testProgress.totalWords) * 100}%"
					></div>
				</div>

				{#if testProgress.currentWord}
					<div class="text-center">
						<div class="text-sm text-blue-600 mb-1">Current word:</div>
						<div class="text-2xl font-bold text-blue-900">{testProgress.currentWord}</div>
						{#if testProgress.timeRemaining > 0}
							<div class="text-sm text-blue-600 mt-2">
								Next word in {testProgress.timeRemaining.toFixed(1)}s
							</div>
						{/if}
					</div>
				{/if}

				<div class="flex justify-center">
					<button 
						class="btn btn-danger"
						on:click={stopTest}
					>
						Stop Test
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Error Display -->
	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<div class="flex items-center">
				<svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
				<span class="text-red-700">{error}</span>
			</div>
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="flex flex-col sm:flex-row gap-4 justify-center">
		{#if testProgress.state === TestState.IDLE}
			<button 
				class="btn btn-primary btn-lg"
				on:click={startQuickTest}
				disabled={isLoading || !speechSupported || wordData.words.length === 0}
			>
				{#if isLoading}
					<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Starting Test...
				{:else}
					🎧 Start Quick Test
				{/if}
			</button>
		{/if}

		<a href="/setup" class="btn btn-secondary btn-lg">
			⚙️ Setup Words & Settings
		</a>
	</div>

	<!-- Getting Started -->
	{#if wordData.words.length === 0}
		<div class="card bg-yellow-50 border-yellow-200">
			<h3 class="font-semibold text-yellow-900 mb-3">🚀 Getting Started</h3>
			<div class="text-yellow-800 space-y-2">
				<p>To start using the dictation app:</p>
				<ol class="list-decimal list-inside space-y-1 ml-4">
					<li>Go to the <a href="/setup" class="text-yellow-900 underline font-medium">Setup</a> page</li>
					<li>Add your word list (one word per line)</li>
					<li>Configure test settings (word count, pause duration)</li>
					<li>Come back here and click "Start Quick Test"</li>
				</ol>
			</div>
		</div>
	{/if}
</div> 