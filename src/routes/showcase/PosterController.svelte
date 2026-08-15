<script lang="ts">
	import { T } from '@threlte/core';
	import { clamp } from 'three/src/math/MathUtils.js';
	import { useTexture } from '@threlte/extras';
	import { untrack } from 'svelte';
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
		fogDensity = 0.052
	}: {
		posters?: Poster[];
		floorHeight?: number;
		distanceByStep: readonly number[];
		cameraPosition?: [number, number, number];
		backgroundColor?: string;
		fogDensity?: number;
	} = $props();

	const posterHeight = 2.5;
	const uniforms = {
		map: { value: null as Texture | null },
		burnAmount: { value: 0 },
		fogColor: { value: new Color('#111824') },
		fogDensity: { value: 0.052 }
	};
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
		uniform float burnAmount;
		uniform vec3 fogColor;
		uniform float fogDensity;
		varying vec2 vUv;
		varying vec3 vViewPosition;
		float hash(vec2 p) { return fract(sin(dot(p, vec2(41.27, 289.19))) * 43758.5453); }
		void main() {
			vec4 texel = texture2D(map, vUv);
			if (texel.a < 0.01 || hash(floor(vUv * vec2(120.0, 180.0))) < burnAmount) discard;
			float fogDepth = -vViewPosition.z;
			float fogRamp = smoothstep(5.5, 9.5, fogDepth);
			float fogAmount = min((1.0 - exp(-fogDensity * fogDensity * fogDepth * fogDepth)) * fogRamp, 0.90);
			gl_FragColor = vec4(mix(texel.rgb, fogColor, fogAmount), texel.a);
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

	const posterDistanceFromCamera = (poster: Poster) => {
		const [x, y, z] = positionFromCircle(
			poster.angle,
			distanceForStep(poster.step),
			floorHeight + posterHeight / 2
		);

		return Math.hypot(x - cameraPosition[0], y - cameraPosition[1], z - cameraPosition[2]);
	};

	// Starts when the camera is close and reaches a complete burn before it
	// crosses the poster plane.
	const burnAmountForDistance = (distance: number) => {
		const progress = clamp((2.6 - distance) / 1.5, 0, 1);

		return progress ** 4;
	};

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
			{@const burnAmount = burnAmountForDistance(posterDistanceFromCamera(poster))}
			{@const materialUniforms = {
				...uniforms,
				map: { value: preparedTexture },
				burnAmount: { value: burnAmount }
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
