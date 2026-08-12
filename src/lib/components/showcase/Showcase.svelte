<script lang="ts">
	import { Canvas } from '@threlte/core';
	import ShowcaseScene from './ShowcaseScene.svelte';
	import ShowcaseInterface from './ShowcaseInterface.svelte';
	import type { ShowcaseDefinition } from '$lib/types/showcase';

	let { showcase }: { showcase: ShowcaseDefinition } = $props();
	let cameraRotation = $state(0);
</script>

<div class="showcase">
	<Canvas>
		<ShowcaseScene {showcase} bind:cameraRotation />
	</Canvas>
	<ShowcaseInterface {cameraRotation} />
</div>

<style>
	.showcase {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
