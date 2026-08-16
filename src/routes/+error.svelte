<svelte:head>
	<title>Jayden Daniel Koek — Page not found</title>
	<meta
		name="description"
		content="The requested page could not be found on Jayden Daniel Koek’s photography portfolio."
	/>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<main>
	<p class="status">404</p>
	<h1>Page not found</h1>
	<p class="message">This photograph is not in the archive.</p>

	<nav aria-label="Page not found navigation">
		<a href="/">Return home</a>
		<a href="/contact">Contact Jayden</a>
	</nav>
</main>

<style>
	:global(html),
	:global(body) {
		min-height: 100%;
		margin: 0;
		background: #020d10;
	}
	main {
		display: grid;
		min-height: 100svh;
		align-content: center;
		padding: clamp(2rem, 8vw, 8rem);
		background: radial-gradient(ellipse at 70% 50%, #073c47 0%, #020d10 62%);
		color: #f5f7f2;
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
	}
	.status {
		margin: 0 0 1rem;
		color: rgba(245, 247, 242, 0.6);
		font-family: system-ui, sans-serif;
		font-size: 0.85rem;
		letter-spacing: 0.08em;
	}
	h1 {
		max-width: 10ch;
		margin: 0;
		font-size: clamp(3rem, 9vw, 8rem);
		font-weight: 400;
		letter-spacing: -0.07em;
		line-height: 0.82;
	}
	.message {
		margin: 2rem 0 0;
		font-size: clamp(1.1rem, 2vw, 1.5rem);
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		margin-top: 2.5rem;
	}
	a {
		color: inherit;
		font-size: 1.05rem;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	a:hover,
	a:focus-visible {
		color: #fff;
	}
	a:focus-visible {
		outline: 1px solid #fff;
		outline-offset: 4px;
	}
</style>
