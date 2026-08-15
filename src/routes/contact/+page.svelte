<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	let isLoading = $state(true);

	const onready = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isLoading = false;
			});
		});
	};
</script>

<svelte:head>
	<title>Contact — Jayden Daniel Koek</title>
</svelte:head>

<main>
	<Canvas>
		<Scene {onready} />
	</Canvas>

	<div class:loaded={!isLoading} class="entry-veil" aria-hidden="true"></div>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html),
	:global(body) {
		margin: 0;
		min-height: 100%;
	}
	main {
		position: relative;
		width: 100vw;
		height: 100svh;
	}
	.entry-veil {
		position: absolute;
		z-index: 20;
		inset: 0;
		background: #000;
		pointer-events: all;
		opacity: 1;
		transition: opacity 650ms ease;
	}
	.entry-veil.loaded {
		pointer-events: none;
		opacity: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.entry-veil {
			transition-duration: 0ms;
		}
	}
</style>
