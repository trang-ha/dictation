<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { wordStore } from '$lib/stores/wordStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { languageStore } from '$lib/stores/languageStore';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	onMount(() => {
		// Load stored data when app starts
		wordStore.load();
		settingsStore.load();
		languageStore.load();
	});
</script>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white shadow-sm border-b">
		<div class="max-w-4xl mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
						</svg>
					</div>
					<h1 class="text-xl font-semibold text-gray-900">{languageStore.translate('app.title')}</h1>
				</div>
				
				<nav class="hidden sm:flex items-center space-x-4">
					<a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
						{languageStore.translate('nav.home')}
					</a>
					<a href="/setup" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
						{languageStore.translate('nav.setup')}
					</a>
					<div class="ml-4">
						<LanguageSelector />
					</div>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-4 py-8">
		<slot />
	</main>

	<footer class="bg-white border-t mt-16">
		<div class="max-w-4xl mx-auto px-4 py-6">
			<div class="text-center text-sm text-gray-500">
				<p>{languageStore.translate('app.title')} - {languageStore.translate('app.subtitle')}</p>
				<p class="mt-1">Works on web and mobile devices</p>
			</div>
		</div>
	</footer>
</div> 
