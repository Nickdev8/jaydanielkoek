<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { orbitDebug } from '$lib/debug/orbit.svelte';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(() => {
		const toggleOrbit = (event: KeyboardEvent) => {
			if (event.repeat || (event.code !== 'Digit0' && event.code !== 'Numpad0')) return;

			orbitDebug.enabled = !orbitDebug.enabled;
		};

		window.addEventListener('keydown', toggleOrbit);
		return () => window.removeEventListener('keydown', toggleOrbit);
	});
</script>

<svelte:head>
	<title>Jayden Daniel Koek</title>
</svelte:head>

{@render children()}

<nav class="utility-nav" aria-label="Utility navigation">
	{#if page.url.pathname !== '/contact'}
		<a class="utility-link" href="/contact" aria-label="Contact">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<rect x="3" y="5" width="18" height="14" rx="1" />
				<path d="m3 6 9 7 9-7" />
			</svg>
		</a>
	{/if}

	{#if page.url.pathname !== '/'}
		<a class="utility-link" href="/" aria-label="Back to home">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
				<path d="M9 21v-6h6v6" />
			</svg>
		</a>
	{/if}
</nav>

<style>
	:global(html) {
		background: #000;
	}

	:global(::view-transition-image-pair(root)) {
		isolation: isolate;
	}

	:global(::view-transition-old(root)) {
		animation: fade-to-black 350ms ease-in both;
		mix-blend-mode: normal;
	}

	:global(::view-transition-new(root)) {
		animation: fade-from-black 500ms 350ms ease-out both;
		mix-blend-mode: normal;
	}

	@keyframes fade-to-black {
		to {
			opacity: 0;
		}
	}

	@keyframes fade-from-black {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(root)),
		:global(::view-transition-new(root)) {
			animation: none;
		}
	}

	.utility-nav {
		position: fixed;
		top: max(1rem, env(safe-area-inset-top));
		right: max(1rem, env(safe-area-inset-right));
		z-index: 16777272;
		display: flex;
		gap: 0.45rem;
		transition: opacity 180ms ease;
	}

	.utility-link {
		display: grid;
		width: 1.5rem;
		aspect-ratio: 1;
		place-items: center;
		color: #fff;
		mix-blend-mode: difference;
	}

	.utility-link svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.35;
	}

	.utility-link:focus-visible {
		outline: 1px solid currentColor;
		outline-offset: 4px;
	}

</style>
