<script lang="ts">
	import type { Poster } from '$lib/showcase/types';
	import { distanceByStep, distanceForStep, positionOnCircle } from '$lib/showcase/layout';

	let {
		posters,
		cameraPosition,
		cameraRotation
	}: {
		posters: Poster[];
		cameraPosition: [number, number, number];
		cameraRotation: number;
	} = $props();

	const radius = $derived(
		Math.max(distanceByStep[3], ...posters.map((poster) => distanceForStep(poster.step))) + 2
	);
	const posterLines = $derived(
		posters.map((poster) => {
			const [x, z] = positionOnCircle(poster.angle, distanceForStep(poster.step));
			const angle = (poster.angle * Math.PI) / 180;
			// Each tick follows the print's horizontal edge, tangent to its gallery ring.
			const dx = Math.cos(angle) * 1.25;
			const dz = Math.sin(angle) * 1.25;
			return { image: poster.image, x1: x - dx, y1: z - dz, x2: x + dx, y2: z + dz };
		})
	);
</script>

<svg
	class="minimap"
	viewBox={`${-radius - 1} ${-radius - 1} ${(radius + 1) * 2} ${(radius + 1) * 2}`}
	role="img"
	aria-label="Plattegrond van de galerie. De stip is jouw positie, de lijnen zijn de foto's."
>
	<circle class="map-background" r={radius} />
	{#each posterLines as line (line.image)}
		<line class="poster" x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
	{/each}
	<g
		class="camera"
		transform={`translate(${cameraPosition[0]} ${cameraPosition[2]}) rotate(${(-cameraRotation * 180) / Math.PI})`}
	>
		<path d="M 0 -1.4 L 0 -3.4" />
		<circle r="0.8" />
	</g>
</svg>

<style>
	.minimap {
		position: absolute;
		z-index: 2;
		left: max(20px, env(safe-area-inset-left));
		bottom: max(20px, env(safe-area-inset-bottom));
		width: 160px;
		height: 160px;
		pointer-events: none;
	}
	.map-background {
		fill: rgba(8, 12, 21, 0.8);
		stroke: rgba(243, 240, 233, 0.4);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.poster {
		stroke: rgba(243, 240, 233, 0.6);
		stroke-width: 1.3;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
	}
	.camera path,
	.camera circle {
		fill: #f3f0e9;
		stroke: #f3f0e9;
		stroke-width: 1.5;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
	}
	@media (max-width: 767px) {
		.minimap {
			width: 120px;
			height: 120px;
		}
	}
</style>
