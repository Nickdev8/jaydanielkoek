<script>
	import { onMount } from 'svelte';
	import { ArrowUpRight } from '@lucide/svelte';
	import AboutMe from './_home/AboutMe.svelte';

	const sections = [
		{
			id: 'index',
			label: 'Overzicht',
			detail: 'Fotografie van Jayden Daniel Koek.'
		},
		{
			id: 'urban',
			label: 'Urban',
			detail: 'Een onderzoek naar beweging, afstand en licht.'
		},
		{ id: 'nature', label: 'Natuur', detail: 'Binnenkort.' },
		{
			id: 'contact',
			label: 'Contact',
			detail: 'Voor opdrachten, samenwerkingen en vragen.'
		},
		{
			id: 'over-mij',
			label: 'Over mij',
			detail: 'Meer over Jayden Daniel Koek — binnenkort.'
		}
	];

	let activeSection = $state(0);
	let scrollPosition = $state(0);
	let selectedImageShift = $state(0);
	let imageShift = $derived(selectedImageShift - Math.min(scrollPosition * 0.025, 110));
	let showcaseActive = $derived(activeSection < sections.length - 1);

	/** @param {string} section @param {number} index */
	const selectSection = (section, index) => {
		activeSection = index;
		selectedImageShift = -index * 24;
		document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	onMount(() => {
		const updateScrollPosition = () => {
			scrollPosition = window.scrollY;
		};
		const sectionObserver = new IntersectionObserver(
			(entries) => {
				const visibleSection = entries.find((entry) => entry.isIntersecting);
				if (!visibleSection) return;

				const index = sections.findIndex((section) => section.id === visibleSection.target.id);
				if (index === -1) return;

				activeSection = index;
				selectedImageShift = -index * 24;
			},
			{ threshold: 0.58 }
		);

		sections.forEach((section) => {
			const element = document.getElementById(section.id);
			if (element) sectionObserver.observe(element);
		});

		window.addEventListener('scroll', updateScrollPosition, { passive: true });
		updateScrollPosition();

		return () => {
			window.removeEventListener('scroll', updateScrollPosition);
			sectionObserver.disconnect();
		};
	});
</script>

<svelte:head>
	<title>Jayden Daniel Koek</title>
	<meta name="description" content="Fotografie van Jayden Daniel Koek." />
	<link
		rel="preload"
		as="image"
		type="image/avif"
		href="/models/render-1280.avif?v=20260812"
		imagesrcset="/models/render-1280.avif?v=20260812 1280w, /models/render-1920.avif?v=20260812 1920w"
		imagesizes="100vw"
	/>
</svelte:head>

<div class="image-stage" class:showcase-active={showcaseActive} aria-hidden="true">
	<picture>
		<source
			type="image/avif"
			srcset="/models/render-1280.avif?v=20260812 1280w, /models/render-1920.avif?v=20260812 1920w"
			sizes="100vw"
		/>
		<source
			type="image/webp"
			srcset="/models/render-1280.webp?v=20260812 1280w, /models/render-1920.webp?v=20260812 1920w"
			sizes="100vw"
		/>
		<img
			src="/models/render-1920.webp?v=20260812"
			alt=""
			fetchpriority="high"
			style={`--image-shift: ${imageShift}px;`}
		/>
	</picture>
</div>
<div class="wash" class:showcase-active={showcaseActive} aria-hidden="true"></div>

<header>
	<a class="name" href="#index" aria-label="Terug naar boven">
		<span>Jayden</span>
		<span>Daniel Koek</span>
	</a>
</header>

<nav class:showcase-active={showcaseActive} aria-label="Collectieoverzicht">
	{#each sections as section, index}
		<button
			class:active={activeSection === index}
			aria-current={activeSection === index ? 'page' : undefined}
			onclick={() => selectSection(section.id, index)}
		>
			<span>{String(index + 1).padStart(2, '0')}</span>
			{section.label}
		</button>
	{/each}
</nav>

<main>
	{#each sections as section, index}
		<section
			id={section.id}
			class:about-page={section.id === 'over-mij'}
			aria-labelledby={`${section.id}-title`}
			onmouseenter={() => {
				activeSection = index;
				selectedImageShift = -index * 24;
			}}
		>
			{#if section.id === 'over-mij'}
				<AboutMe />
			{:else}
				<div class:hero-copy={index === 0} class="copy">
					<p>{String(index + 1).padStart(2, '0')}</p>
					<h1 id={`${section.id}-title`}>{section.label}</h1>
					<span>{section.detail}</span>

					{#if section.id === 'urban'}
						<a href="/urban">
							Bekijk de Urban-collectie
							<ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
						</a>
					{/if}
				</div>
			{/if}
		</section>
	{/each}
</main>

<style>
	:global(html) {
		scroll-behavior: smooth;
		background: #020b0f;
	}

	:global(body) {
		margin: 0;
		background: #020b0f;
		color: #e6efed;
	}

	.image-stage,
	.wash,
	nav {
		position: fixed;
	}

	.image-stage,
	.wash {
		inset: 0;
	}

	.image-stage {
		z-index: 0;
		overflow: hidden;
		background: #020b0f;
		transition: opacity 450ms ease;
	}

	.image-stage picture,
	.image-stage img {
		width: 100%;
		height: 100%;
	}

	.image-stage img {
		display: block;
		object-fit: cover;
		object-position: 50% calc(50% + var(--image-shift));
		transition: object-position 900ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.wash {
		z-index: 1;
		pointer-events: none;
		background:
			linear-gradient(90deg, rgba(0, 6, 9, 0.7), transparent 60%),
			linear-gradient(0deg, rgba(0, 5, 8, 0.8), transparent 42%),
			radial-gradient(
				circle at 65% 43%,
				transparent 16%,
				rgba(0, 5, 8, 0.35) 76%,
				rgba(0, 3, 5, 0.78) 100%
			);
		transition: opacity 450ms ease;
	}

	header,
	nav {
		z-index: 2;
	}

	header {
		position: absolute;
		top: clamp(1.2rem, 3.5vw, 4rem);
		left: clamp(1.3rem, 5.5vw, 6.5rem);
	}

	.name {
		display: grid;
		color: #edf1e7;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(2.6rem, 6vw, 7.5rem);
		font-weight: 400;
		letter-spacing: -0.075em;
		line-height: 0.76;
		text-align: left;
		text-decoration: none;
	}

	.name span:last-child {
		padding-left: 0.03em;
	}

	nav {
		left: clamp(1.1rem, 3.2vw, 3.8rem);
		top: 50%;
		display: grid;
		gap: 0.45rem;
		transform: translateY(-50%);
		transition: opacity 300ms ease;
	}

	.image-stage:not(.showcase-active),
	.wash:not(.showcase-active),
	nav:not(.showcase-active) {
		opacity: 0;
		pointer-events: none;
	}

	nav button {
		display: grid;
		grid-template-columns: 1.5rem auto;
		gap: 0.55rem;
		border: 0;
		padding: 0.12rem 0;
		background: none;
		color: rgba(230, 239, 237, 0.44);
		cursor: pointer;
		font:
			500 clamp(0.64rem, 0.8vw, 0.76rem)/1.3 ui-monospace,
			SFMono-Regular,
			Menlo,
			monospace;
		letter-spacing: 0.07em;
		text-align: left;
		text-transform: uppercase;
		transition: color 180ms ease;
	}

	nav button span {
		font-size: 0.58rem;
		opacity: 0.7;
	}

	nav button:hover,
	nav button.active {
		color: #eef4ee;
	}

	main {
		position: relative;
		z-index: 2;
	}

	section {
		display: grid;
		min-height: 100svh;
		padding: 0 clamp(1.3rem, 10vw, 13rem);
	}

	section.about-page {
		display: block;
		min-height: 100svh;
		background: #e8ebe5;
		color: #122229;
	}

	.copy {
		align-self: end;
		max-width: 22rem;
		margin: 0 0 clamp(3rem, 13vh, 10rem) clamp(5.6rem, 12vw, 14rem);
	}

	.copy > p,
	.copy > span,
	.copy > a {
		font:
			500 0.68rem/1.45 ui-monospace,
			SFMono-Regular,
			Menlo,
			monospace;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.copy > p {
		margin: 0 0 0.75rem;
		color: rgba(230, 239, 237, 0.62);
	}

	.copy h1 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(2rem, 5vw, 5.75rem);
		font-weight: 400;
		letter-spacing: -0.065em;
		line-height: 0.9;
	}

	.copy > span {
		display: block;
		max-width: 19rem;
		margin-top: 1.1rem;
		color: rgba(230, 239, 237, 0.68);
		letter-spacing: 0.04em;
		text-transform: none;
	}

	.copy > a {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
		margin-top: 1.4rem;
		border-bottom: 1px solid rgba(230, 239, 237, 0.55);
		padding-bottom: 0.2rem;
		color: #edf4ed;
		text-decoration: none;
		transition:
			color 180ms ease,
			border-color 180ms ease;
	}

	.copy a:hover {
		border-color: #7de1e4;
		color: #7de1e4;
	}

	.hero-copy {
		visibility: hidden;
	}

	@media (max-width: 700px) {
		.image-stage img {
			object-position: 68% calc(50% + var(--image-shift));
		}

		.name {
			font-size: clamp(2.8rem, 14vw, 5rem);
		}

		nav {
			top: auto;
			bottom: 1.4rem;
			display: flex;
			gap: 0.75rem;
			transform: none;
		}

		nav button {
			display: block;
			font-size: 0.58rem;
		}

		nav button span {
			display: none;
		}

		section {
			padding: 0 1.3rem;
		}

		.copy {
			margin-left: 0;
			margin-bottom: 6rem;
		}
	}
</style>
