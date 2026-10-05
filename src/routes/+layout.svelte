<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, setContext } from 'svelte';
	import { orbitDebug } from '$lib/debug/orbit.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { siteUiKey, type SiteUi } from '$lib/site/ui';
	import { siteContent } from '$lib/site/content';
	import '$lib/site/site.css';

	let { children } = $props();
	const ui = $state<SiteUi>({ menuOpen: false });
	setContext(siteUiKey, ui);

	const metadata = $derived.by(() => {
		const pathname: string = page.url.pathname;
		if (pathname.startsWith('/showcase')) {
			return {
				title: 'Fotografie | Jayden Daniel Koek',
				description:
					'Bekijk de natuur- en stadsfotografie van Jayden Daniel Koek in een interactieve galerie.'
			};
		}
		if (pathname === '/over') {
			return {
				title: 'Over | Jayden Daniel Koek',
				description: 'Over Jayden Daniel Koek en zijn fotografie.'
			};
		}
		if (pathname === '/contact') {
			return {
				title: 'Contact | Jayden Daniel Koek',
				description: 'Een vraag over fotografie? Neem contact op met Jayden Daniel Koek.'
			};
		}
		return {
			title: 'Jayden Daniel Koek | Fotograaf',
			description:
				"Natuur en het leven in de stad. Bekijk een selectie foto's van Jayden Daniel Koek."
		};
	});
	const canonicalUrl = $derived(new URL(page.url.pathname, page.url.origin).toString());
	const previewImage = $derived(new URL(siteContent.heroImage.src, page.url.origin).toString());

	onNavigate((navigation) => {
		if (
			!document.startViewTransition ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		)
			return;
		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(() => {
		const toggleOrbit = (event: KeyboardEvent) => {
			if (ui.menuOpen || event.repeat || (event.code !== 'Digit0' && event.code !== 'Numpad0'))
				return;
			orbitDebug.enabled = !orbitDebug.enabled;
		};
		window.addEventListener('keydown', toggleOrbit);
		return () => window.removeEventListener('keydown', toggleOrbit);
	});
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
	<link rel="canonical" href={canonicalUrl} />
	<link
		rel="preload"
		href="/fonts/baskervville-regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteContent.name} />
	<meta property="og:locale" content="nl_NL" />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={previewImage} />
	<meta property="og:image:alt" content={siteContent.heroImage.alt} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={metadata.title} />
	<meta name="twitter:description" content={metadata.description} />
	<meta name="twitter:image" content={previewImage} />
</svelte:head>

<a class="skip-link" href="#main-content">Naar de inhoud</a>
<SiteHeader />
<div id="main-content" tabindex="-1">
	{@render children()}
</div>

<style>
	.skip-link {
		position: fixed;
		top: -100px;
		left: 16px;
		z-index: 16777273;
		padding: 12px 16px;
		color: var(--paper);
		background: var(--ink);
	}
	.skip-link:focus {
		top: 16px;
	}
	:global(::view-transition-old(root)) {
		animation: fade-out 180ms ease both;
	}
	:global(::view-transition-new(root)) {
		animation: fade-in 180ms ease both;
	}
	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}
</style>
