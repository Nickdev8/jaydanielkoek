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
	<section class="screen-reader-context">
		<h1>Contact Jayden Daniel Koek</h1>
		<p>Get in touch with photographer Jayden Daniel Koek for photography enquiries.</p>
		<a href="/">Return to Jayden Daniel Koek’s photography portfolio</a>
	</section>

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
	.screen-reader-context {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
