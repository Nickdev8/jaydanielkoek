<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Color, PlaneGeometry, ShaderMaterial } from 'three';
	import { Reflector } from 'three/addons/objects/Reflector.js';

	let {
		position = [0, 0, 0],
		brightness = 0.8,
		distortionStrength = 0.00035,
		backgroundColor = '#033542'
	}: {
		position?: [number, number, number];
		brightness?: number;
		distortionStrength?: number;
		backgroundColor?: string;
	} = $props();

	const ReflectorWithShader = Reflector as typeof Reflector & {
		ReflectorShader: {
			uniforms: Record<string, { value: unknown }>;
			fragmentShader: string;
		};
	};
	const reflectorShader = {
		...ReflectorWithShader.ReflectorShader,
		uniforms: {
			...ReflectorWithShader.ReflectorShader.uniforms,
			time: { value: 0 },
			distortionStrength: { value: 0.00035 },
			reflectionBrightness: { value: 0.8 },
			reflectionBackgroundColor: { value: new Color('#033542') }
		},
		fragmentShader: ReflectorWithShader.ReflectorShader.fragmentShader
			.replace(
				'uniform vec3 color;',
				`uniform vec3 color;
uniform float time;
uniform float distortionStrength;
uniform float reflectionBrightness;
uniform vec3 reflectionBackgroundColor;`
			)
			.replace(
				'vec4 base = texture2DProj( tDiffuse, vUv );',
				`vec4 distortedUv = vUv;
float waveA = sin( vUv.x * 75.0 + time * 0.45 );
float waveB = sin( vUv.y * 62.0 - time * 0.32 );
distortedUv.xy += vec2( waveA * waveB, waveB ) * distortionStrength * distortedUv.w;
vec4 base = texture2DProj( tDiffuse, distortedUv );
base.rgb = reflectionBackgroundColor + ( base.rgb - reflectionBackgroundColor ) * reflectionBrightness;`
			)
	};
	const reflector = new Reflector(new PlaneGeometry(12, 12), {
		color: new Color(0.5, 0.5, 0.5),
		shader: reflectorShader,
		clipBias: 0.003,
		textureWidth: 2048,
		textureHeight: 2048,
		multisample: 4
	});
	const reflectorMaterial = reflector.material as ShaderMaterial;

	$effect(() => {
		reflectorMaterial.uniforms.distortionStrength.value = distortionStrength;
		reflectorMaterial.uniforms.reflectionBrightness.value = brightness;
		reflectorMaterial.uniforms.reflectionBackgroundColor.value.set(backgroundColor);
	});

	useTask((delta) => {
		reflectorMaterial.uniforms.time.value += delta;
	});
</script>

<T is={reflector} {position} rotation={[-Math.PI / 2, 0, 0]} />
