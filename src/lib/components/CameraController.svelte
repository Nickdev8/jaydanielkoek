<script lang="ts">
	import { T } from '@threlte/core';
	import { useTask } from '@threlte/core';
	import { useKeyboard } from '@threlte/extras';
	import type { Group } from 'three';
	import { clamp, damp } from 'three/src/math/MathUtils.js';
	import { Vector3 } from 'three';

	const KeyboardControls = [
		['W', 'S', 'A', 'D'],
		['arrowup', 'arrowdown', 'arrowleft', 'arrowright']
	];

	let {
		maximumCameraDistance,
		cameraPosition = $bindable([0, 0, 0] as [number, number, number])
	}: {
		maximumCameraDistance: number;
		cameraPosition?: [number, number, number];
	} = $props();

	// Camera
	const keyboard = useKeyboard();
	const moveSpeed = 4;
	const turnPivotDistance = 0.75;
	const minimumTurnRadius = 4.5;
	const lateralSpeed = 4;
	const walkPastLastPosterDistance = 2;
	const movementBoundarySoftness = 3;
	let angularVelocity = 0;
	let movementVelocity = 0;

	const turnSmoothness = 3;
	const movementSmoothness = 3;

	const worldCameraPosition = new Vector3();

	let pivot = $state.raw<Group | undefined>(undefined);
	let camera = $state.raw<Group | undefined>(undefined);

	const softenMovementNearBoundary = (remainingDistance: number) => {
		const t = clamp(remainingDistance / movementBoundarySoftness, 0, 1);
		return t * t * (3 - 2 * t);
	};

	keyboard.on('keyup', (event) => {
		KeyboardControls.forEach((KeyboardControlCombination) => {
			if (KeyboardControlCombination.includes(event.key.toLocaleLowerCase())) {
				event.preventDefault();
			}
		});
	});

	useTask(
		(delta) => {
			if (!pivot || !camera) return;

			camera.getWorldPosition(worldCameraPosition);
			cameraPosition = [worldCameraPosition.x, worldCameraPosition.y, worldCameraPosition.z];

			let turnDirection = 0;
			let moveDirection = 0;

			KeyboardControls.forEach((KeyboardControlCombination) => {
				turnDirection = clamp(
					turnDirection +
						Number(keyboard.key(KeyboardControlCombination[3]).pressed) -
						Number(keyboard.key(KeyboardControlCombination[2]).pressed),
					-1,
					1
				);
				moveDirection = clamp(
					moveDirection +
						Number(keyboard.key(KeyboardControlCombination[0]).pressed) -
						Number(keyboard.key(KeyboardControlCombination[1]).pressed),
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
</script>

<T.Group bind:ref={pivot}>
	<T.Group bind:ref={camera} position={[0, 0, -turnPivotDistance]}>
		<T.PerspectiveCamera makeDefault fov={45} />
		<T.Mesh position={[0, 0, 0]}>
			<T.SphereGeometry args={[0.2, 32, 16]} />
			<T.MeshBasicMaterial color="red" />
		</T.Mesh>
	</T.Group>
</T.Group>
