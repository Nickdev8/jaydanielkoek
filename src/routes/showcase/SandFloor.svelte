<script lang="ts">
	import { T } from '@threlte/core';
	import { Color } from 'three';

	let {
		floorHeight = -1.4,
		radius = 50,
		backgroundColor = '#080c15',
		fogDensity = 0.052
	} = $props<{
		floorHeight?: number;
		radius?: number;
		backgroundColor?: string;
		fogDensity?: number;
	}>();

	const sandUniforms = {
		// Anything around alphaLow becomes transparent;
		// anything around alphaHigh becomes opaque.
		alphaLow: { value: 0.055 },
		alphaHigh: { value: 0.14 },
		fogColor: { value: new Color('#080c15') },
		fogDensity: { value: 0.052 }
	};

	$effect(() => {
		sandUniforms.fogColor.value.set(backgroundColor);
		sandUniforms.fogDensity.value = fogDensity;
	});

	const sandVertexShader = `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
            vUv = uv;

            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;

            vec4 viewPosition = viewMatrix * worldPosition;
            vViewPosition = viewPosition.xyz;

            gl_Position = projectionMatrix * viewPosition;
        }
    `;

	const sandFragmentShader = `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        uniform float alphaLow;
        uniform float alphaHigh;
        uniform vec3 fogColor;
        uniform float fogDensity;

        float hash21(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        vec2 hash22(vec2 p) {
            float n = hash21(p);
            return vec2(n, hash21(p + 19.19));
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);

            f = f * f * (3.0 - 2.0 * f);

            float a = hash21(i);
            float b = hash21(i + vec2(1.0, 0.0));
            float c = hash21(i + vec2(0.0, 1.0));
            float d = hash21(i + vec2(1.0, 1.0));

            return mix(
                mix(a, b, f.x),
                mix(c, d, f.x),
                f.y
            );
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;

            mat2 rot = mat2(
                 0.80,  0.60,
                -0.60,  0.80
            );

            for (int i = 0; i < 5; i++) {
                value += noise(p) * amplitude;
                p = rot * p * 2.03;
                amplitude *= 0.5;
            }

            return value;
        }

        float warpedNoise(vec2 p) {
            vec2 q = vec2(
                fbm(p + vec2(0.0, 0.0)),
                fbm(p + vec2(5.2, 1.3))
            );

            vec2 r = vec2(
                fbm(p + 3.0 * q + vec2(1.7, 9.2)),
                fbm(p + 3.0 * q + vec2(8.3, 2.8))
            );

            return fbm(p + 4.0 * r);
        }

        float stipple(vec2 uv, float density) {
            vec2 gridUv = uv * density;

            vec2 cell = floor(gridUv);
            vec2 local = fract(gridUv);

            vec2 randomPos = 0.15 + hash22(cell) * 0.7;

            float d = length(local - randomPos);

            float randomSize = mix(
                0.045,
                0.13,
                hash21(cell + 9.3)
            );

            return 1.0 - smoothstep(
                randomSize,
                randomSize + 0.025,
                d
            );
        }

        void main() {
            // A fixed, rectangular coordinate system: lines flow left to right
            // and do not use the world origin as a centre.
            vec2 p = vUv * vec2(5.4, 8.0) + vec2(11.8, 27.4);

            float broadWarp = (fbm(vec2(p.x * 0.50, p.y * 0.18)) - 0.5) * 2.2;
            broadWarp += sin(p.x * 1.25 + fbm(p * 0.35) * 5.0) * 0.22;
            broadWarp += sin(p.x * 2.70 - p.y * 0.16) * 0.08;

            // Horizontal, irregular contour bands like quiet ripples in sand.
            float contourField = p.y * 1.25 + broadWarp;
            float bandA = abs(fract(contourField * 5.5) - 0.5);
            float bandB = abs(fract(contourField * 8.5 + 0.18) - 0.5);
            float bandC = abs(fract(contourField * 13.0 + 0.41) - 0.5);

            float lineA = 1.0 - smoothstep(0.018, 0.045, bandA);
            float lineB = 1.0 - smoothstep(0.012, 0.030, bandB);
            float lineC = 1.0 - smoothstep(0.008, 0.021, bandC);

            float lineDensity = smoothstep(0.20, 0.75, fbm(p * 0.58));
            lineA *= mix(0.28, 1.0, lineDensity);
            lineB *= mix(0.18, 0.80, lineDensity);
            lineC *= mix(0.10, 0.58, lineDensity);

            // Fine print-like dots, most noticeable in the near floor texture.
            float dotsA = stipple(vUv, 105.0);
            float dotsB = stipple(vUv + 3.71, 148.0);
            float dots = max(dotsA, dotsB * 0.45);
            dots *= smoothstep(0.38, 0.72, fbm(p * 0.82));

            vec3 wideLine = vec3(0.30, 0.32, 0.34);
            vec3 fineLine = vec3(0.18, 0.20, 0.22);
            vec3 hairline = vec3(0.09, 0.10, 0.12);
            vec3 dotColor = vec3(0.12, 0.14, 0.16);

            vec3 color = vec3(0.0);
            color += wideLine * lineA;
            color += fineLine * lineB;
            color += hairline * lineC;
            color += dotColor * dots * 0.34;

            float grain = hash21(gl_FragCoord.xy * 0.73);
            color += (grain - 0.5) * 0.002;

            float lineMask = max(max(lineA, lineB), lineC);
            float alphaFromLines = smoothstep(alphaLow, alphaHigh, lineMask + dots * 0.08);
            // This matches Three.js FogExp2, which gets dense but has no hard
            // cutoff where a distant poster would be completely removed.
            float fogDepth = -vViewPosition.z;
            float fogAmount = 1.0 - exp(-fogDensity * fogDensity * fogDepth * fogDepth);
            color = mix(color, fogColor, fogAmount);

			// Fade opacity too. With transparent shader materials, colour mixing alone
			// leaves dark lines visible over the background.
			gl_FragColor = vec4(color, alphaFromLines * 0.28 * (1.0 - fogAmount));
        }
    `;
</script>

<T.Mesh position={[0, floorHeight, 0]} rotation.x={-Math.PI / 2}>
	<!-- radius is the half-width: 50 creates a 100 by 100 floor. -->
	<T.PlaneGeometry args={[radius * 2, radius * 2]} />

	<T.ShaderMaterial
		vertexShader={sandVertexShader}
		fragmentShader={sandFragmentShader}
		uniforms={sandUniforms}
		transparent={true}
		depthWrite={false}
		toneMapped={false}
	/>
</T.Mesh>
