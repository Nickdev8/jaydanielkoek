<script lang="ts">
	import { siteContent } from '$lib/site/content';
</script>

<footer class="site-footer page-shell">
	<p>© {new Date().getFullYear()} {siteContent.name}</p>
	<a href="https://nickesselman.nl">Gemaakt door Nick Esselman</a>
</footer>

<style>
	.site-footer {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1.5rem;
		padding-bottom: 1.5rem;
		border-top: 1px solid rgba(32, 37, 34, 0.18);
		color: var(--muted);
		font-size: 0.82rem;
	}
	.site-footer p {
		margin: 0;
	}
	.site-footer a {
		color: inherit;
		text-underline-offset: 0.2em;
	}
	@media (max-width: 520px) {
		.site-footer {
			flex-direction: column;
		}
	}
</style>
