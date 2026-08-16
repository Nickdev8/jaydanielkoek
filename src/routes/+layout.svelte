<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { orbitDebug } from '$lib/debug/orbit.svelte';

	let { children } = $props();

	const metadata = $derived.by(() => {
		const pathname = page.url.pathname;
		const category = pathname.match(/^\/showcase\/(nature|urban)$/)?.[1];
		const isLensSelector = pathname.startsWith('/lenses/');
		const isModelCredits = pathname === '/model-credits';

		if (category) {
			const label = category[0].toUpperCase() + category.slice(1);
			return {
				title: `Jayden Daniel Koek — ${label} photography`,
				description: `Explore ${label.toLowerCase()} photography by Jayden Daniel Koek in an interactive 3D gallery.`,
				indexable: true
			};
		}

		if (pathname === '/contact') {
			return {
				title: 'Jayden Daniel Koek — Contact',
				description: 'Contact photographer Jayden Daniel Koek for photography enquiries.',
				indexable: true
			};
		}

		if (isLensSelector) {
			return {
				title: 'Jayden Daniel Koek — Choose a category',
				description: 'Choose a photography category in Jayden Daniel Koek’s interactive portfolio.',
				indexable: false
			};
		}

		if (isModelCredits) {
			return {
				title: 'Jayden Daniel Koek — Model credits',
				description: '3D model credits for Jayden Daniel Koek’s photography portfolio.',
				indexable: false
			};
		}

		return {
			title: 'Jayden Daniel Koek — Photographer',
			description:
				'Photography portfolio of Jayden Daniel Koek. Explore urban and nature photographs in an interactive 3D showcase.',
			indexable: true
		};
	});
	const canonicalUrl = $derived(new URL(page.url.pathname, page.url.origin).toString());
	const previewImage = $derived(new URL('/readme-homepage.png', page.url.origin).toString());

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
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
	<meta name="robots" content={metadata.indexable ? 'index, follow' : 'noindex, follow'} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Jayden Daniel Koek" />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={previewImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={metadata.title} />
	<meta name="twitter:description" content={metadata.description} />
	<meta name="twitter:image" content={previewImage} />
</svelte:head>

{@render children()}

<nav class="utility-nav" aria-label="Utility navigation">
	{#if page.url.pathname !== '/contact'}
		<a class="utility-link" href="/contact" aria-label="Contact">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<rect x="3" y="5" width="18" height="14" rx="1" />
				<path d="m3 6 9 7 9-7" />
			</svg>
			<span>Contact</span>
		</a>
	{/if}

	{#if page.url.pathname !== '/'}
		<a class="utility-link" href="/" aria-label="Home">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
				<path d="M9 21v-6h6v6" />
			</svg>
			<span>Home</span>
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
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: #fff;
		font: 0.75rem/1 system-ui, sans-serif;
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
