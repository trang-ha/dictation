<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	let dictatedWords = [];
	let isLoading = true;
	let error = '';

	onMount(() => {
		try {
			const wordsParam = $page.url.searchParams.get('words');
			if (wordsParam) {
				dictatedWords = JSON.parse(decodeURIComponent(wordsParam));
			} else {
				error = 'No test results found';
			}
		} catch (err) {
			error = 'Failed to load test results: ' + err.message;
		} finally {
			isLoading = false;
		}
	});

	function startNewTest() {
		goto('/');
	}

	function setupWords() {
		goto('/setup');
	}

	function copyResults() {
		const text = dictatedWords.join('\n');
		navigator.clipboard.writeText(text).then(() => {
			// Show brief success indication
			const button = document.querySelector('#copyBtn');
			if (button) {
				const originalText = button.textContent;
				button.textContent = '✓ Copied!';
				setTimeout(() => {
					button.textContent = originalText;
				}, 2000);
			}
		}).catch(() => {
			// Fallback for older browsers
			const textarea = document.createElement('textarea');
			textarea.value = text;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		});
	}

	function shareResults() {
		if (navigator.share) {
			navigator.share({
				title: 'English Dictation Results',
				text: `I practiced English dictation with ${dictatedWords.length} words: ${dictatedWords.join(', ')}`
			});
		} else {
			// Fallback - copy to clipboard
			copyResults();
		}
	}
</script>

<svelte:head>
	<title>Test Results - English Dictation</title>
	<meta name="description" content="View your English dictation test results and practiced words." />
</svelte:head>

<div class="space-y-8">
	{#if isLoading}
		<div class="text-center py-12">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
			<p class="text-gray-600">Loading results...</p>
		</div>
	{:else if error}
		<div class="text-center py-12">
			<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Results</h1>
			<p class="text-gray-600 mb-6">{error}</p>
			<button class="btn btn-primary" on:click={startNewTest}>
				🏠 Go to Home
			</button>
		</div>
	{:else}
		<!-- Success Header -->
		<div class="text-center">
			<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Test Completed! 🎉</h1>
			<p class="text-xl text-gray-600">
				You practiced <span class="font-semibold text-blue-600">{dictatedWords.length}</span> words
			</p>
		</div>

		<!-- Results Card -->
		<div class="card">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-gray-900">Dictated Words</h2>
				<div class="flex gap-2">
					<button
						id="copyBtn"
						class="btn btn-sm btn-secondary"
						on:click={copyResults}
						title="Copy words to clipboard"
					>
						📋 Copy
					</button>
					<button
						class="btn btn-sm btn-secondary"
						on:click={shareResults}
						title="Share results"
					>
						📤 Share
					</button>
				</div>
			</div>

			{#if dictatedWords.length > 0}
				<!-- Word List -->
				<div class="space-y-4">
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each dictatedWords as word, index}
							<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 slide-up" style="animation-delay: {index * 0.1}s;">
								<div class="flex items-center justify-between">
									<div>
										<div class="text-sm text-blue-600 font-medium">Word {index + 1}</div>
										<div class="text-lg font-semibold text-blue-900">{word}</div>
									</div>
									<div class="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
										<span class="text-blue-800 text-sm font-bold">{index + 1}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Summary Statistics -->
					<div class="bg-gray-50 rounded-lg p-6 mt-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div class="text-center">
								<div class="text-2xl font-bold text-blue-600">{dictatedWords.length}</div>
								<div class="text-sm text-gray-600">Words Practiced</div>
							</div>
							<div class="text-center">
								<div class="text-2xl font-bold text-green-600">{dictatedWords.filter(word => word.length > 5).length}</div>
								<div class="text-sm text-gray-600">Long Words (5+ letters)</div>
							</div>
							<div class="text-center">
								<div class="text-2xl font-bold text-purple-600">{Math.round(dictatedWords.reduce((sum, word) => sum + word.length, 0) / dictatedWords.length)}</div>
								<div class="text-sm text-gray-600">Avg. Word Length</div>
							</div>
							<div class="text-center">
								<div class="text-2xl font-bold text-orange-600">{dictatedWords.reduce((sum, word) => sum + word.length, 0)}</div>
								<div class="text-sm text-gray-600">Total Characters</div>
							</div>
						</div>
					</div>

					<!-- Word List for Review -->
					<div class="mt-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-3">Review List</h3>
						<div class="bg-white border border-gray-200 rounded-lg p-4">
							<div class="text-gray-700 leading-relaxed">
								{dictatedWords.join(' • ')}
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="text-center py-8">
					<p class="text-gray-500">No words were dictated in this session.</p>
				</div>
			{/if}
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<button class="btn btn-primary btn-lg" on:click={startNewTest}>
				🔄 Start New Test
			</button>
			<button class="btn btn-secondary btn-lg" on:click={setupWords}>
				⚙️ Edit Settings
			</button>
		</div>

		<!-- Practice Tips -->
		<div class="card bg-blue-50 border-blue-200">
			<h3 class="text-lg font-semibold text-blue-900 mb-3">💡 Practice Tips</h3>
			<div class="text-blue-800 space-y-2">
				<p>• <strong>Review regularly:</strong> Come back to practice the same words multiple times</p>
				<p>• <strong>Vary difficulty:</strong> Mix short and long words for balanced practice</p>
				<p>• <strong>Adjust timing:</strong> Increase pause duration for challenging words</p>
				<p>• <strong>Use different voices:</strong> Try various voices to improve comprehension</p>
				<p>• <strong>Practice consistently:</strong> Regular short sessions are more effective than long ones</p>
			</div>
		</div>
	{/if}
</div> 