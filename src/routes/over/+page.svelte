<script lang="ts">
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { siteContent } from '$lib/site/content';
</script>

<main class="about-page">
	<section class="about page-shell">
		<div class="copy">
			<h1>Over mij</h1>
			<p>{siteContent.bio}</p>
			<a class="text-link" href="/showcase/all">Bekijk de fotografie</a>
		</div>
		<figure>
			<img
				src={siteContent.aboutImage.src}
				alt={siteContent.aboutImage.alt}
				width="1440"
				height="1022"
			/>
			<figcaption>IJsvogel</figcaption>
		</figure>
	</section>
	<SiteFooter />
</main>

<style>
	.about-page {
		min-height: 100svh;
		background: var(--paper);
		color: var(--ink);
	}
	.about {
		display: grid;
		min-height: 100svh;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		gap: clamp(3rem, 9vw, 9rem);
		padding-top: max(152px, 12vw);
		padding-bottom: clamp(5rem, 10vw, 9rem);
	}
	h1 {
		margin: 0 0 2rem;
		font: 400 clamp(3.5rem, 7vw, 6.5rem)/0.95 var(--font-display);
		letter-spacing: -0.05em;
	}
	.copy p {
		max-width: 34rem;
		margin: 0 0 1.5rem;
		font-size: clamp(1.05rem, 1.5vw, 1.25rem);
		line-height: 1.7;
	}
	figure {
		margin: 0;
	}
	figure img {
		display: block;
		width: 100%;
		height: auto;
	}
	figcaption {
		padding-top: 0.65rem;
		color: var(--muted);
		font-size: 0.85rem;
	}
	@media (max-width: 700px) {
		.about {
			grid-template-columns: 1fr;
			gap: 3rem;
		}
	}
</style>
