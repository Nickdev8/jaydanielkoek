<script lang="ts">
	import PhotoViewer from '$lib/components/PhotoViewer.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import InlineCamera from '$lib/components/InlineCamera.svelte';
	import { siteContent } from '$lib/site/content';

	let selectedIndex = $state<number | null>(null);
	let opener = $state<HTMLElement | null>(null);

	function openPhoto(index: number, event: MouseEvent) {
		opener = event.currentTarget as HTMLElement;
		selectedIndex = index;
	}
</script>

<main class="home-page">
	<section class="hero" aria-labelledby="home-title">
		<img
			class="hero-image"
			src={siteContent.heroImage.src}
			alt={siteContent.heroImage.alt}
			fetchpriority="high"
		/>
		<div class="hero-shade"></div>
		<div class="hero-copy">
			<h1 id="home-title">Jayden<br />Daniel Koek</h1>
			<a class="hero-link" href="/showcase/all">Bekijk de fotografie</a>
		</div>
	</section>

	<section class="intro page-shell">
		<div class="intro-copy">
			<p>{siteContent.bio}</p>
			<a class="text-link" href="/over">Over mij</a>
		</div>
		<InlineCamera />
	</section>

	<section class="selected page-shell" aria-label="Een selectie foto's">
		<div class="photo-grid">
			{#each siteContent.featured as photo, index}
				<button
					class="photo-button"
					type="button"
					aria-label={`Bekijk foto: ${photo.alt}`}
					onclick={(event) => openPhoto(index, event)}
				>
					<img
						src={photo.src}
						alt={photo.alt}
						width={photo.width}
						height={photo.height}
						loading="lazy"
					/>
					<span>{photo.caption}</span>
				</button>
			{/each}
		</div>
		<a class="all-photos text-link" href="/showcase/all">Bekijk alle fotografie</a>
	</section>
	<SiteFooter />
</main>

<PhotoViewer photos={siteContent.featured} bind:selectedIndex bind:opener />

<style>
	.home-page {
		background: var(--paper);
		color: var(--ink);
	}
	.hero {
		position: relative;
		min-height: 100svh;
		overflow: hidden;
		background: #24322d;
		color: white;
	}
	.hero-image,
	.hero-shade {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.hero-image {
		object-fit: cover;
		object-position: center;
	}
	.hero-shade {
		background:
			linear-gradient(180deg, rgba(0, 0, 0, 0.5), transparent 28%),
			linear-gradient(90deg, rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.08) 72%),
			linear-gradient(0deg, rgba(0, 0, 0, 0.24), transparent 58%);
	}
	.hero-copy {
		position: absolute;
		z-index: 1;
		left: clamp(2rem, 9vw, 9rem);
		top: 55%;
		transform: translateY(-30%);
		animation: hero-copy-in 200ms ease both;
	}
	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(4.5rem, 8vw, 8rem);
		letter-spacing: -0.055em;
		line-height: 1.05;
	}
	.hero-link {
		display: inline-block;
		margin-top: clamp(2rem, 4vw, 3.5rem);
		color: white;
		font-size: clamp(1rem, 1.35vw, 1.2rem);
		text-underline-offset: 0.28em;
		transition: opacity 200ms ease;
	}
	.hero-link:hover {
		opacity: 0.72;
	}
	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		align-items: center;
		gap: clamp(32px, 6vw, 96px);
		padding-top: clamp(5rem, 10vw, 9rem);
		padding-bottom: clamp(5rem, 9vw, 8rem);
	}
	.intro p {
		max-width: 760px;
		margin: 0 0 1.5rem;
		font-family: var(--font-display);
		font-size: clamp(2rem, 3.3vw, 3.6rem);
		line-height: 1.12;
	}
	.selected {
		padding-bottom: clamp(5rem, 10vw, 9rem);
	}
	.all-photos {
		display: inline-block;
		margin-top: clamp(3rem, 6vw, 5rem);
	}
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: clamp(2rem, 5vw, 5rem) clamp(1.5rem, 4vw, 4rem);
		align-items: start;
	}
	.photo-button {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: zoom-in;
	}
	.photo-button img {
		display: block;
		width: 100%;
		height: auto;
		transition: opacity 200ms ease;
	}
	.photo-button:hover img {
		opacity: 0.84;
	}
	.photo-button span {
		display: block;
		padding-top: 0.7rem;
		color: var(--muted);
		font-size: 0.88rem;
	}
	.photo-button:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: 5px;
	}
	@media (max-width: 760px) {
		.intro {
			grid-template-columns: 1fr;
			gap: 24px;
		}
	}
	@media (max-width: 680px) {
		.hero {
			min-height: max(100svh, 480px);
		}
		.hero-image {
			object-position: 70% center;
		}
		.hero-shade {
			background:
				linear-gradient(180deg, rgba(0, 0, 0, 0.56) 0%, rgba(0, 0, 0, 0.5) 43%, transparent 65%),
				linear-gradient(0deg, rgba(0, 0, 0, 0.2), transparent 48%);
		}
		.hero-copy {
			top: max(128px, 22%);
			left: 1.5rem;
			transform: none;
		}
		h1 {
			font-size: clamp(3rem, 15vw, 6.2rem);
		}
		.hero-link {
			margin-top: 1.6rem;
		}
		.photo-grid {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
	}
	@keyframes hero-copy-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			transition-duration: 0.01ms !important;
			animation-duration: 0.01ms !important;
		}
	}
</style>
