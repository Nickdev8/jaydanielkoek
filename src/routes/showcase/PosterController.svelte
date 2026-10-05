<script lang="ts">
	import { T } from '@threlte/core';
	import { distanceForStep, positionOnCircle } from '$lib/showcase/layout';
	import { useTexture } from '@threlte/extras';
	import { onMount, untrack } from 'svelte';
	import { Color, SRGBColorSpace, Vector3, type Texture } from 'three';
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
	const nearFadeStart = 3.2;
	const nearFadeEnd = 0.65;
	const uniforms = {
		map: { value: null as Texture | null },
		fogColor: { value: new Color('#111824') },
		fogDensity: { value: 0.052 },
		viewerPosition: { value: new Vector3() },
		nearFadeStart: { value: nearFadeStart },
		nearFadeEnd: { value: nearFadeEnd }
	};
	let hasReportedReady = false;
	const vertexShader = `
		uniform vec3 viewerPosition;
		varying vec2 vUv;
		varying vec3 vViewPosition;
		varying float vViewerDistance;
		#ifdef USE_ALPHAHASH
			varying vec3 vPosition;
		#endif
		void main() {
			vUv = uv;
			#ifdef USE_ALPHAHASH
				vPosition = position;
			#endif
			vec3 posterCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
			vViewerDistance = distance(viewerPosition.xz, posterCenter.xz);
			vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
			vViewPosition = viewPosition.xyz;
			gl_Position = projectionMatrix * viewPosition;
		}
	`;
	const fragmentShader = `
		uniform sampler2D map;
		uniform vec3 fogColor;
		uniform float fogDensity;
		uniform float nearFadeStart;
		uniform float nearFadeEnd;
		uniform float imageAspect;
		varying vec2 vUv;
		varying vec3 vViewPosition;
		varying float vViewerDistance;
		#ifdef USE_ALPHAHASH
			varying vec3 vPosition;
		#endif
		#include <alphahash_pars_fragment>

		float noiseHash(vec2 point) {
			return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
		}

		float valueNoise(vec2 point) {
			vec2 cell = floor(point);
			vec2 local = fract(point);
			vec2 blend = local * local * (3.0 - 2.0 * local);
			return mix(
				mix(noiseHash(cell), noiseHash(cell + vec2(1.0, 0.0)), blend.x),
				mix(noiseHash(cell + vec2(0.0, 1.0)), noiseHash(cell + vec2(1.0, 1.0)), blend.x),
				blend.y
			);
		}

		float dissolveNoise(vec2 point) {
			float noise = 0.5 * valueNoise(point);
			noise += 0.25 * valueNoise(point * 2.0 + vec2(5.2, 1.3));
			noise += 0.125 * valueNoise(point * 4.0 + vec2(1.7, 9.2));
			noise += 0.0625 * valueNoise(point * 8.0 + vec2(8.3, 2.8));
			return noise / 0.9375;
		}

		void main() {
			vec4 texel = texture2D(map, vUv);
			float visibility = smoothstep(nearFadeEnd, nearFadeStart, vViewerDistance);
			float coverage = 1.0;
			if (visibility < 1.0) {
				float noise = dissolveNoise(vUv * vec2(imageAspect, 1.0) * 7.0);
				float threshold = mix(-0.16, 1.16, visibility);
				coverage = smoothstep(noise - 0.16, noise + 0.16, threshold);
			}
			float alpha = texel.a * visibility * coverage;
			if (alpha < 0.01) discard;
			vec4 diffuseColor = vec4(texel.rgb, alpha);
			#include <alphahash_fragment>
			float fogDepth = -vViewPosition.z;
			float fogRamp = smoothstep(5.5, 9.5, fogDepth);
			float fogAmount = min((1.0 - exp(-fogDensity * fogDensity * fogDepth * fogDepth)) * fogRamp, 0.90);
			gl_FragColor = vec4(mix(texel.rgb, fogColor, fogAmount), 1.0);
			#include <colorspace_fragment>
		}
	`;

	$effect(() => {
		uniforms.fogColor.value.set(backgroundColor);
		uniforms.fogDensity.value = fogDensity;
		// Use the viewer's position for both the main image and its floor reflection.
		uniforms.viewerPosition.value.set(...cameraPosition);
	});

	const positionFromCircle = (angleDegrees: number, distance: number, y: number) => {
		const [x, z] = positionOnCircle(angleDegrees, distance);
		return [x, y, z] as [number, number, number];
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
				distanceForStep(poster.step, distanceByStep),
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
				map: { value: preparedTexture },
				imageAspect: { value: texture.image.width / texture.image.height }
			}}
			<T.ShaderMaterial
				{vertexShader}
				{fragmentShader}
				uniforms={materialUniforms}
				alphaHash
				transparent={false}
				depthWrite={true}
				toneMapped={false}
			/>
		</T.Mesh>
	{/each}
{:catch error}
	{@const reported = reportPosterTextureError(error)}
{/await}
