<script lang="ts">
	import { T } from '@threlte/core';
	import { ContactShadows, OrbitControls } from '@threlte/extras';

	import SandFloor from './SandFloor.svelte';
	import CameraController from './CameraController.svelte';
	import PosterContorller from './PosterContorller.svelte';

	import type { Poster } from '$lib/types/poster';

	/*
	step 1: 72 * 5
	step 2: 40 * 9
	step 3: 15 * 15
	*/

	const posters: Poster[] = [
		{ image: '/posters/MEME.jpg', angle: 72 * 0, step: 1 },
		{ image: '/posters/MEME2.jpg', angle: 72 * 0 + 15, step: 1.3 },

		{ image: '/posters/DuivenDam.jpg', angle: 72 * 8, step: 1 },

		{ image: '/posters/phasant.jpg', angle: 72 * 1, step: 1 },
		{ image: '/posters/phasant2.jpg', angle: 72 * 1 + 15, step: 1.3 },

		{ image: '/posters/hoogland.jpg', angle: 72 * 2, step: 1 },
	];

	const distanceByStep = [0, 5.63, 13, 20, 27] as const;

	const backgroundColor = '#111824'; //#080c15
	const fogDensity = 0.052;
	const cameraStartRotation = -72*0;

	const maximumCameraDistance = Math.max(...distanceByStep.slice(1)) + 2;

	const floorHeight = -1.4;
</script>

<T.Color attach="background" args={[backgroundColor]} />
<T.FogExp2 attach="fog" args={[backgroundColor, fogDensity]} />

<CameraController {maximumCameraDistance} {cameraStartRotation} />

<!-- <T.PerspectiveCamera makeDefault position={[0, 15, 0]} fov={90}>
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

<SandFloor {floorHeight} radius={100} {backgroundColor} {fogDensity} />

<T.Mesh position={[0, floorHeight + 0.01, 0]} rotation.x={-Math.PI / 2}>
	<T.CircleGeometry args={[3, 64]} />
	<T.MeshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} />
</T.Mesh>

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />

<PosterContorller {floorHeight} {posters} {distanceByStep} />
