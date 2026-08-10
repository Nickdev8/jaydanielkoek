<script lang="ts">
	import { T } from '@threlte/core';

	let { floorHeight = -1.4, radius = 50 } = $props<{
		floorHeight?: number;
		radius?: number;
	}>();

	const sandUniforms = {
		// Anything around alphaLow becomes transparent;
		// anything around alphaHigh becomes opaque.
		alphaLow: { value: 0.055 },
		alphaHigh: { value: 0.14 }
	};

	const sandVertexShader = `
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
            vUv = uv;

            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;

            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `;

	const sandFragmentShader = `
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        uniform float alphaLow;
        uniform float alphaHigh;

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
            // Fixed square UV mapping. The offset prevents the noise field from
            // having any meaningful relationship to the world's origin.
            vec2 p = vUv * 5.5 + vec2(11.8, 27.4);

            float shape = warpedNoise(p * 0.72);
            shape += (fbm(p * 2.1) - 0.5) * 0.16;
            shape += (fbm(p * 5.0) - 0.5) * 0.05;

            // Subtle blue-black sand-line palette.
            vec3 c0 = vec3(0.055, 0.115, 0.145);
            vec3 c1 = vec3(0.040, 0.090, 0.115);
            vec3 c2 = vec3(0.022, 0.055, 0.070);
            vec3 c3 = vec3(0.010, 0.025, 0.032);

            // Repeated slices through the noise field create flowing contour lines.
            float bandCount = 22.0;
            float bandA = abs(fract(shape * bandCount) - 0.5);
            float bandB = abs(fract(shape * bandCount + 0.18) - 0.5);
            float bandC = abs(fract(shape * bandCount + 0.36) - 0.5);

            float lineA = 1.0 - smoothstep(0.035, 0.065, bandA);
            float lineB = 1.0 - smoothstep(0.040, 0.070, bandB);
            float lineC = 1.0 - smoothstep(0.045, 0.080, bandC);

            float directional = 0.5 + 0.5 * sin(p.x * 1.4 + fbm(p * 1.3) * 5.0);
            lineA *= mix(0.75, 1.0, directional);
            lineB *= mix(0.70, 1.0, 1.0 - directional);
            lineC *= mix(0.80, 1.0, fbm(p * 0.8));

            float dotsA = stipple(vWorldPosition.xz, 5.2);
            float dotsB = stipple(vWorldPosition.xz + 17.7, 8.5);

            float stippleNoise = fbm(p * 1.8);
            float dots = max(dotsA, dotsB * 0.55);
            dots *= smoothstep(0.25, 0.72, stippleNoise);

            // The floor is made only from lines and sparse sand grain.
            vec3 color = vec3(0.0);
            color += c0 * lineA;
            color += c1 * lineB * 0.95;
            color += c2 * lineC * 0.90;
            color += c3 * dots * 0.50;
            color = min(color, c0);

            float grain = hash21(gl_FragCoord.xy * 0.73);
            color += (grain - 0.5) * 0.004;

            // --------------------------------------------------
            // ALPHA FROM LINES
            // transparent between contours, visible on the sand lines
            // --------------------------------------------------
            float lineMask = max(max(lineA, lineB), lineC);
            float alphaFromLines = smoothstep(alphaLow, alphaHigh, lineMask + dots * 0.15);

            gl_FragColor = vec4(color, alphaFromLines);
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
