<script lang="ts">
	import { Canvas } from '@threlte/core';
	import SceneLoadingVeil from '$lib/components/SceneLoadingVeil.svelte';
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

<main class="contact-page">
	<Canvas>
		<Scene {onready} />
	</Canvas>

	<SceneLoadingVeil loaded={!isLoading} />
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html:has(.contact-page)),
	:global(body:has(.contact-page)) {
		margin: 0;
		min-height: 100%;
		background: #000;
	}
	main {
		position: relative;
		width: 100vw;
		height: 100svh;
		background: #000;
	}
</style>
