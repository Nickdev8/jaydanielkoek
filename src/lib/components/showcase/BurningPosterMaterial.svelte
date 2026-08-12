<script lang="ts">
	import { T } from '@threlte/core';
	import { Color, type Texture } from 'three';

	let {
		texture,
		burnAmount,
		backgroundColor,
		fogDensity
	}: {
		texture: Texture;
		burnAmount: number;
		backgroundColor: string;
		fogDensity: number;
	} = $props();

	const uniforms = {
		map: { value: null as Texture | null },
		burnAmount: { value: 0 },
		fogColor: { value: new Color('#111824') },
		fogDensity: { value: 0.052 }
	};

	$effect(() => {
		uniforms.map.value = texture;
		uniforms.burnAmount.value = burnAmount;
		uniforms.fogColor.value.set(backgroundColor);
		uniforms.fogDensity.value = fogDensity;
	});

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

		float hash(vec2 p) {
			return fract(sin(dot(p, vec2(41.27, 289.19))) * 43758.5453);
		}

		void main() {
			vec4 texel = texture2D(map, vUv);
			if (texel.a < 0.01) discard;

			float ash = hash(floor(vUv * vec2(120.0, 180.0)));
			if (ash < burnAmount) discard;

			vec3 color = texel.rgb;

			float fogDepth = -vViewPosition.z;
			// The closest step is intentionally untouched: it is the active image.
			float fogRamp = smoothstep(5.5, 9.5, fogDepth);
			// Keep a small amount of image information visible even at the farthest step.
			float fogAmount = min(
				(1.0 - exp(-fogDensity * fogDensity * fogDepth * fogDepth)) * fogRamp,
				0.90
			);
			color = mix(color, fogColor, fogAmount);

			gl_FragColor = vec4(color, texel.a);
			#include <colorspace_fragment>
		}
	`;
</script>

<T.ShaderMaterial {vertexShader} {fragmentShader} {uniforms} transparent toneMapped={false} />
