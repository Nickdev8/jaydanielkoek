<script lang="ts">
	import { T } from '@threlte/core';
	import { clamp } from 'three/src/math/MathUtils.js';
	import { useTexture } from '@threlte/extras';
	import { onMount, untrack } from 'svelte';
	import { Color, SRGBColorSpace, type Texture } from 'three';
	type Poster = {
		image: string;
		angle: number;
		step: number;
	};

	let {
		posters = [],
		floorHeight = -1.4,
		distanceByStep,
		cameraPosition = [0, 0, 0] as [number, number, number],
		backgroundColor = '#111824',
		fogDensity = 0.052,
		onready
	}: {
		posters?: Poster[];
		floorHeight?: number;
		distanceByStep: readonly number[];
		cameraPosition?: [number, number, number];
		backgroundColor?: string;
		fogDensity?: number;
		onready?: () => void;
	} = $props();

	const posterHeight = 2.5;
	// Keep the prints just above the reflective surface to avoid a visible intersection.
	const posterSurfaceGap = 0.04;
	const uniforms = {
		map: { value: null as Texture | null },
		fogColor: { value: new Color('#111824') },
		fogDensity: { value: 0.052 }
	};
	let hasReportedReady = false;
	const vertexShader = `
		varying vec2 vUv;
		varying vec3 vViewPosition;
		void main() {
			vUv = uv;
			vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
			vViewPosition = viewPosition.xyz;
			gl_Position = projectionMatrix * viewPosition;
		}
	`;
	const fragmentShader = `
		uniform sampler2D map;
		uniform vec3 fogColor;
		uniform float fogDensity;
		varying vec2 vUv;
		varying vec3 vViewPosition;
		void main() {
			vec4 texel = texture2D(map, vUv);
			float alpha = texel.a;
			if (alpha < 0.01) discard;
			float fogDepth = -vViewPosition.z;
			float fogRamp = smoothstep(5.5, 9.5, fogDepth);
			float fogAmount = min((1.0 - exp(-fogDensity * fogDensity * fogDepth * fogDepth)) * fogRamp, 0.90);
			gl_FragColor = vec4(mix(texel.rgb, fogColor, fogAmount), alpha);
			#include <colorspace_fragment>
		}
	`;

	$effect(() => {
		uniforms.fogColor.value.set(backgroundColor);
		uniforms.fogDensity.value = fogDensity;
	});

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
		console.error('[PosterController] Could not load one or more poster textures.', {
			images: Object.values(posterTextureSources),
			error
		});
	};

	const reportReady = () => {
		if (hasReportedReady) return;

		hasReportedReady = true;
		onready?.();
	};

	onMount(() => {
		posterTextures.promise.then(reportReady).catch(reportReady);
	});
</script>

{#await posterTextures then textures}
	{#each posters as poster (poster.image)}
		<T.Mesh
			position={positionFromCircle(
				poster.angle,
				distanceForStep(poster.step),
				floorHeight + posterSurfaceGap + posterHeight / 2
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
			{@const materialUniforms = {
				...uniforms,
				map: { value: preparedTexture }
			}}
			<T.ShaderMaterial
				{vertexShader}
				{fragmentShader}
				uniforms={materialUniforms}
				transparent
				toneMapped={false}
			/>
		</T.Mesh>
	{/each}
{:catch error}
	{@const reported = reportPosterTextureError(error)}
{/await}
