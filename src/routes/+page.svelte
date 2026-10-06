<script lang="ts">
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import InlineCamera from '$lib/components/InlineCamera.svelte';
	import { siteContent } from '$lib/site/content';
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

	<section class="projects" aria-label="Projecten">
		<div class="page-shell">
			<div class="project-list">
				{#each siteContent.featured as project, index}
					<article class="project">
						<img
							class="project-image"
							src={project.src}
							alt={project.alt}
							width={project.width}
							height={project.height}
							loading="lazy"
						/>
						<div class="project-copy">
							<div class="project-number" aria-label={`Project ${index + 1}`}>
								<span>{String(index + 1).padStart(2, '0')}</span>
							</div>
							<h2>{project.caption}</h2>
							<p>{project.description}</p>
						</div>
					</article>
				{/each}
			</div>
			<a class="all-photos text-link" href="/showcase/all">Bekijk alle fotografie</a>
		</div>
	</section>
	<SiteFooter />
</main>

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
	.projects {
		padding-block: clamp(3rem, 6vw, 5rem) clamp(5rem, 10vw, 9rem);
		background: #fff;
	}
	.all-photos {
		display: inline-block;
		margin-top: clamp(3rem, 6vw, 5rem);
	}
	.project-list {
		display: grid;
		gap: clamp(3rem, 7vw, 6rem);
	}
	.project {
		display: grid;
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
		align-items: center;
	}
	.project-image {
		width: 100%;
		height: clamp(260px, 35vw, 460px);
		object-fit: cover;
		mask-image: linear-gradient(to right, #000 60%, transparent 100%);
	}
	.project-copy {
		position: relative;
		margin-left: clamp(-4rem, -5vw, -1rem);
		padding: clamp(2rem, 5vw, 5rem) 0 1.5rem;
	}
	.project-number {
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: 22rem;
		margin-bottom: 1.75rem;
		color: var(--muted);
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
	}
	.project-number::after {
		content: '';
		flex: 1;
		height: 1px;
		background: #d9dcd7;
	}
	.project-copy h2 {
		margin: 0 0 1rem;
		font-size: clamp(2rem, 4.5vw, 4.5rem);
		font-style: italic;
		font-synthesis: style;
		letter-spacing: -0.035em;
		line-height: 1.1;
	}
	.project-copy p {
		max-width: 36ch;
		margin: 0;
		color: var(--muted);
		font-size: clamp(0.95rem, 1.25vw, 1.1rem);
		line-height: 1.65;
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
		.project {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		}
		.project-copy {
			margin-left: -0.5rem;
			padding-top: 1.5rem;
		}
		.project-number {
			margin-bottom: 1rem;
		}
		.project-image {
			height: 100%;
			min-height: 320px;
			mask-image: linear-gradient(to right, #000 55%, transparent 100%);
		}
		.project-copy h2 {
			font-size: clamp(1.4rem, 5vw, 2rem);
			overflow-wrap: anywhere;
		}
		.project-copy p {
			font-size: 0.875rem;
			line-height: 1.5;
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
