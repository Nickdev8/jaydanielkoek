<script lang="ts">
	import { T } from '@threlte/core';
	import { ContactShadows, OrbitControls } from '@threlte/extras';
	import type { Mesh } from 'three';
	import { clamp } from 'three/src/math/MathUtils.js';
	import { useTexture } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { SRGBColorSpace } from 'three';

	import SandFloor from './SandFloor.svelte';
	import CameraController from './CameraController.svelte';

	const posters = [
		{ id: 'jay-near', image: '/posters/jay.png', angle: 0, distance: 5.63 },
		{ id: 'jay-right', image: '/posters/jay.png', angle: 15, distance: 13.1 },
		{ id: 'jay-left', image: '/posters/jay.png', angle: -10, distance: 12.83 },
		{ id: 'jay-left-back', image: '/posters/jay.png', angle: -20, distance: 20.31 }
	];

	// Scene
	let cameraPosition = $state<[number, number, number]>([0, 0, 0]);
	const maximumCameraDistance = Math.max(...posters.map((poster) => poster.distance)) + 2;

	const floorHeight = -1.4;
	const posterHeight = 2.5;

	// Posters
	let poster: Mesh | undefined;

	const positionFromCircle = (angleDegrees: number, distance: number, y: number) => {
		const angle = degreesToRadians(angleDegrees);

		return [Math.sin(angle) * distance, y, -Math.cos(angle) * distance] as [number, number, number];
	};

	const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

	const posterTextures = useTexture(
		Object.fromEntries(posters.map((poster) => [poster.id, poster.image]))
	);

	const posterDistanceFromCamera = (poster: (typeof posters)[number]) => {
		const [x, y, z] = positionFromCircle(
			poster.angle,
			poster.distance,
			floorHeight + posterHeight / 2
		);

		return Math.hypot(x - cameraPosition[0], y - cameraPosition[1], z - cameraPosition[2]);
	};

	const smoothstep = (value: number) => {
		const t = clamp(value, 0, 1);
		return t * t * (3 - 2 * t);
	};

	const posterAppearance = (cameraDistance: number) => {
		let opacity: number;

		if (cameraDistance <= 5) {
			return { opacity: 1, color: '#ffffff' };
		} else if (cameraDistance <= 8.9) {
			opacity = 1 - 0.3 * smoothstep((cameraDistance - 3.5) / (8.9 - 3.5));
		} else if (cameraDistance <= 14.1) {
			opacity = 0.7 - 0.15 * smoothstep((cameraDistance - 8.9) / (14.1 - 8.9));
		} else {
			opacity = 0.55 - 0.15 * smoothstep((cameraDistance - 14.1) / 6);
		}

		opacity = clamp(opacity, 0.4, 1);

		// Gentle brightness reduction: 100% brightness near, 91% at minimum opacity.
		const brightness = 0.85 + opacity * 0.15;
		const channel = Math.round(brightness * 255);

		return { opacity, color: `rgb(${channel}, ${channel}, ${channel})` };
	};

	onMount(() => {
		poster?.lookAt(0, 0, 0);
	});
</script>

<CameraController {maximumCameraDistance} bind:cameraPosition />

<!-- <T.PerspectiveCamera makeDefault position={[0, 10, 0]} fov={60}>
	<OrbitControls enableDamping autoRotateSpeed={0.5} target.y={1.5} />
</T.PerspectiveCamera> -->

<!-- 
<Grid
	position.y={floorHeight - 0.01}
	gridSize={[100, 100]}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/>
 -->

<SandFloor {floorHeight} radius={50} />

<T.Mesh position={[0, floorHeight + 0.01, 0]} rotation.x={-Math.PI / 2}>
	<T.CircleGeometry args={[3, 64]} />
	<T.MeshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} />
</T.Mesh>

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />

{#await posterTextures then textures}
	{#each posters as poster (poster.id)}
		<T.Mesh
			position={positionFromCircle(poster.angle, poster.distance, floorHeight + posterHeight / 2)}
			rotation.y={-degreesToRadians(poster.angle)}
		>
			<T.PlaneGeometry
				args={[
					posterHeight * (textures[poster.id].image.width / textures[poster.id].image.height),
					posterHeight
				]}
			/>

			{@const texture = textures[poster.id]}
			{@const preparedTexture = ((texture.colorSpace = SRGBColorSpace), texture)}
			{@const appearance = posterAppearance(posterDistanceFromCamera(poster))}
			<T.MeshBasicMaterial
				map={preparedTexture}
				color={appearance.color}
				transparent
				opacity={appearance.opacity}
				toneMapped={false}
			/>
		</T.Mesh>
	{/each}
{/await}
