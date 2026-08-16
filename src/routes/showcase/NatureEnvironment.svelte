<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { EquirectangularReflectionMapping, SRGBColorSpace, type Texture } from 'three';

	const { scene } = useThrelte();
	let { onready }: { onready?: () => void } = $props();
	const panorama = useTexture('/models/Skybox_baseColor.webp');
	let hasReportedReady = false;

	const preparePanorama = (texture: Texture) => {
		texture.mapping = EquirectangularReflectionMapping;
		texture.colorSpace = SRGBColorSpace;
		texture.flipY = false;
		texture.needsUpdate = true;
		return texture;
	};

	const reportReady = () => {
		if (hasReportedReady) return;

		hasReportedReady = true;
		onready?.();
	};

	onMount(() => {
		panorama.promise.then(reportReady).catch(reportReady);
	});

	$effect(() => {
		const previousBackgroundIntensity = scene.backgroundIntensity;
		const previousEnvironmentIntensity = scene.environmentIntensity;
		scene.backgroundIntensity = 0.46;
		scene.environmentIntensity = 0.32;

		return () => {
			scene.backgroundIntensity = previousBackgroundIntensity;
			scene.environmentIntensity = previousEnvironmentIntensity;
		};
	});
</script>

{#await panorama then texture}
	{@const preparedPanorama = preparePanorama(texture)}
	<T is={preparedPanorama} attach="background" />
	<T is={preparedPanorama} attach="environment" />
{/await}
