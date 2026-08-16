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

<main>
	<Canvas>
		<Scene {onready} />
	</Canvas>

	<SceneLoadingVeil loaded={!isLoading} />
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
</style>
