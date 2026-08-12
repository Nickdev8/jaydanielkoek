<script>
	import Showcase from '$lib/components/showcase/Showcase.svelte';
	import { urbanShowcase } from './showcase';
</script>

<div class="scene">
	<Showcase showcase={urbanShowcase} />
	<div class="vignette"></div>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	div {
		width: 100vw;
		height: 100vh;
		background: #080c15;
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
			transparent 26%,
			rgba(0, 0, 0, 0.2) 48%,
			rgba(0, 0, 0, 0.6) 74%,
			rgba(0, 0, 0, 0.9) 100%
		);
	}
</style>
