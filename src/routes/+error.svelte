<script lang="ts">
	import { page } from '$app/state';
	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Pagina niet gevonden' : 'Er ging iets mis'} | Jayden Daniel Koek</title>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<main class="error-page">
	<section class="page-shell">
		<p>{page.status}</p>
		<h1>{notFound ? 'Pagina niet gevonden' : 'Er ging iets mis'}</h1>
		<p>{notFound ? 'Deze pagina bestaat niet.' : 'Probeer het later opnieuw.'}</p>
		<a class="text-link" href="/">Terug naar home</a>
	</section>
</main>

<style>
	.error-page {
		min-height: 100svh;
		padding-block: max(160px, 16vh) 80px;
		background: var(--paper);
	}
	h1 {
		font-size: clamp(48px, 7vw, 96px);
		line-height: 1.1;
		margin: 24px 0;
		max-width: 12ch;
	}
</style>
