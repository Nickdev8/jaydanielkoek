<script lang="ts">
	import { T } from '@threlte/core';
	import { clamp } from 'three/src/math/MathUtils.js';
	import { useTexture } from '@threlte/extras';
	import { untrack } from 'svelte';
	import { SRGBColorSpace } from 'three';

	import type { Poster } from '$lib/types/poster';

	let {
		posters = [],
		floorHeight = -1.4,
		distanceByStep
	}: {
		posters?: Poster[];
		floorHeight?: number;
		distanceByStep: readonly number[];
	} = $props();

	const posterHeight = 2.5;

	const distanceForStep = (step: number) => {
		const finalStep = distanceByStep.length - 1;
		const lowerStep = clamp(Math.floor(step), 1, finalStep);
		const upperStep = clamp(Math.ceil(step), 1, finalStep);
		const progress = step - lowerStep;

		return (
			distanceByStep[lowerStep] + (distanceByStep[upperStep] - distanceByStep[lowerStep]) * progress
		);
	};

	const positionFromCircle = (angleDegrees: number, distance: number, y: number) => {
		const angle = degreesToRadians(angleDegrees);

		return [Math.sin(angle) * distance, y, -Math.cos(angle) * distance] as [number, number, number];
	};

	const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

	const posterTextureSources: Record<string, string> = untrack(() =>
		Object.fromEntries(posters.map((poster) => [poster.image, poster.image]))
	);
	const posterTextures = useTexture<Record<string, string>>(posterTextureSources);

	const reportPosterTextureError = (error: unknown) => {
		console.error('[PosterContorller] Could not load one or more poster textures.', {
			images: Object.values(posterTextureSources),
			error
		});
	};
</script>

{#await posterTextures then textures}
	{#each posters as poster (poster.image)}
		<T.Mesh
			position={positionFromCircle(
				poster.angle,
				distanceForStep(poster.step),
				floorHeight + posterHeight / 2
			)}
			rotation.y={-degreesToRadians(poster.angle)}
		>
			<T.PlaneGeometry
				args={[
					posterHeight * (textures[poster.image].image.width / textures[poster.image].image.height),
					posterHeight
				]}
			/>

			{@const texture = textures[poster.image]}
			{@const preparedTexture = ((texture.colorSpace = SRGBColorSpace), texture)}
			<T.MeshBasicMaterial map={preparedTexture} toneMapped={false} fog={true} />
		</T.Mesh>
	{/each}
{:catch error}
	{@const reported = reportPosterTextureError(error)}
{/await}
