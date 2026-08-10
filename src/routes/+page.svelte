<script>
	import App from '$lib/components/App.svelte';
</script>

<div class="scene">
	<App />
	<div class="vignette"></div>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	div {
		width: 100vw;
		height: 100vh;
		background: rgb(13, 19, 32);
		background: linear-gradient(180deg, rgba(13, 19, 32, 1) 0%, rgba(8, 12, 21, 1) 100%);
	}

	.scene {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse at center,
			transparent 42%,
			rgba(0, 0, 0, 0.16) 66%,
			rgba(0, 0, 0, 0.68) 100%
		);
	}
</style>
