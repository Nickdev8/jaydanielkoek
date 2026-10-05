<script lang="ts">
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { siteContent } from '$lib/site/content';
</script>

<main class="contact-page">
	<section class="contact page-shell">
		<h1>Contact</h1>
		<p>Een vraag over mijn fotografie? Stuur me een bericht.</p>
		<div class="links">
			<a class="text-link" href={`mailto:${siteContent.email}`}>{siteContent.email}</a>
			<a class="text-link" href={siteContent.instagram} target="_blank" rel="noreferrer"
				>Instagram</a
			>
		</div>
	</section>
	<SiteFooter />
</main>

<style>
	.contact-page {
		display: flex;
		min-height: 100svh;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
	}
	.contact {
		flex: 1;
		padding-top: max(152px, 13vw);
		padding-bottom: clamp(5rem, 10vw, 9rem);
	}
	h1 {
		margin: 0 0 1.5rem;
		font: 400 clamp(4rem, 10vw, 9rem)/0.9 var(--font-display);
		letter-spacing: -0.055em;
	}
	.contact p {
		margin: 0 0 2rem;
		font-size: clamp(1rem, 1.4vw, 1.2rem);
	}
	.links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.8rem;
	}
</style>
