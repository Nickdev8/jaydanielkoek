<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { ContactShadows, Grid, useKeyboard, OrbitControls } from '@threlte/extras';
	import type { Group, Mesh } from 'three';
	import { clamp, damp } from 'three/src/math/MathUtils.js';
	import { useTexture } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { Vector3 } from 'three';

	const posters = [
		{ id: 'jay-near', image: '/posters/jay.png', angle: 0, distance: 5.63 },
		{ id: 'jay-right', image: '/posters/jay.png', angle: 15, distance: 13.1 },
		{ id: 'jay-left', image: '/posters/jay.png', angle: -10, distance: 12.83 },
		{ id: 'jay-left-back', image: '/posters/jay.png', angle: -20, distance: 20.31 }
	];
	const Controls = [
		['W', 'S', 'A', 'D'],
		['arrowup', 'arrowdown', 'arrowleft', 'arrowright']
	];

	// Camera
	const keyboard = useKeyboard();
	const moveSpeed = 4;
	const turnPivotDistance = 0.75;
	const minimumTurnRadius = 4.5;
	const lateralSpeed = 4;
	const walkPastLastPosterDistance = 2;
	const movementBoundarySoftness = 3;
	const maximumCameraDistance =
		Math.max(...posters.map((poster) => poster.distance)) + walkPastLastPosterDistance;
	let angularVelocity = 0;
	let movementVelocity = 0;

	const turnSmoothness = 10;
	const movementSmoothness = 6;

	const worldCameraPosition = new Vector3();
	let cameraPosition = $state<[number, number, number]>([0, 0, 0]);

	let pivot = $state.raw<Group | undefined>(undefined);
	let camera = $state.raw<Group | undefined>(undefined);

	const softenMovementNearBoundary = (remainingDistance: number) => {
		const t = clamp(remainingDistance / movementBoundarySoftness, 0, 1);
		return t * t * (3 - 2 * t);
	};

	keyboard.on('keyup', (event) => {
		Controls.forEach((ControlCombination) => {
			if (ControlCombination.includes(event.key.toLocaleLowerCase())) {
				event.preventDefault();
			}
		});
	});

	useTask(
		(delta) => {
			if (!pivot || !camera) return;

			let turnDirection = 0;
			let moveDirection = 0;

			Controls.forEach((ControlCombination) => {
				turnDirection = clamp(
					turnDirection +
						Number(keyboard.key(ControlCombination[3]).pressed) -
						Number(keyboard.key(ControlCombination[2]).pressed),
					-1,
					1
				);
				moveDirection = clamp(
					moveDirection +
						Number(keyboard.key(ControlCombination[0]).pressed) -
						Number(keyboard.key(ControlCombination[1]).pressed),
					-1,
					1
				);
			});

			const radius = Math.max(0.001, Math.hypot(camera.position.x, camera.position.z));
			const turnRadius = Math.max(radius, minimumTurnRadius);

			const targetAngularVelocity = turnDirection * (lateralSpeed / turnRadius);
			angularVelocity = damp(angularVelocity, targetAngularVelocity, turnSmoothness, delta);
			pivot.rotation.y -= angularVelocity * delta;

			const cameraDistance = -camera.position.z;
			const remainingDistance =
				moveDirection > 0
					? maximumCameraDistance - cameraDistance
					: cameraDistance - turnPivotDistance;
			const boundarySpeedMultiplier =
				moveDirection === 0 ? 1 : softenMovementNearBoundary(remainingDistance);
			const targetMovementVelocity = moveDirection * moveSpeed * boundarySpeedMultiplier;
			movementVelocity = damp(movementVelocity, targetMovementVelocity, movementSmoothness, delta);

			camera.position.z -= movementVelocity * delta;
			camera.position.z = clamp(camera.position.z, -maximumCameraDistance, -turnPivotDistance);

			if (
				(camera.position.z === -maximumCameraDistance && movementVelocity > 0) ||
				(camera.position.z === -turnPivotDistance && movementVelocity < 0)
			) {
				movementVelocity = 0;
			}

			camera.getWorldPosition(worldCameraPosition);

			cameraPosition = [worldCameraPosition.x, worldCameraPosition.y, worldCameraPosition.z];
		},
		{ after: keyboard.task }
	);

	// Scene
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

		if (cameraDistance <= 3.5) {
			opacity = 1;
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

<T.Group bind:ref={pivot}>
	<T.Group bind:ref={camera} position={[0, 0, -turnPivotDistance]}>
		<T.PerspectiveCamera makeDefault fov={45} />
	</T.Group>
</T.Group>

<!-- <T.PerspectiveCamera makeDefault position={[0, 10, 0]} fov={60}>
	<OrbitControls enableDamping autoRotateSpeed={0.5} target.y={1.5} />
</T.PerspectiveCamera> -->

<T.DirectionalLight intensity={0.8} position.x={5} position.y={10} />
<T.AmbientLight intensity={0.2} />

<Grid
	position.y={floorHeight - 0.01}
	gridSize={[100, 100]}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/>

<T.Mesh position={[0, floorHeight, 0]} rotation.x={-Math.PI / 2}>
	<T.CircleGeometry args={[3, 64]} />
	<T.MeshBasicMaterial color="#ffffff" />
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
			{@const appearance = posterAppearance(posterDistanceFromCamera(poster))}
			<T.MeshBasicMaterial
				map={textures[poster.id]}
				color={appearance.color}
				transparent
				opacity={appearance.opacity}
			/>
		</T.Mesh>
	{/each}
{/await}
