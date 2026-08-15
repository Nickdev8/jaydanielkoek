<script lang="ts">
	import { T } from '@threlte/core';
	import { useTask } from '@threlte/core';
	import { OrbitControls, useKeyboard } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { orbitDebug } from '$lib/debug/orbit.svelte';
	import { Euler, Quaternion, type Group, type Mesh, type PerspectiveCamera } from 'three';
	import { clamp, damp } from 'three/src/math/MathUtils.js';
	import { Vector3 } from 'three';

	const KeyboardControls = [
		['W', 'S', 'A', 'D'],
		['arrowup', 'arrowdown', 'arrowleft', 'arrowright']
	];

	let {
		maximumCameraDistance,
		cameraStartRotation = 0,
		cameraPosition = $bindable([0, 0, 0] as [number, number, number]),
		cameraRotation = $bindable(0)
	}: {
		maximumCameraDistance: number;
		cameraStartRotation?: number;
		cameraPosition?: [number, number, number];
		cameraRotation?: number;
	} = $props();

	// Camera
	const keyboard = useKeyboard();
	const moveSpeed = 4;
	const turnPivotDistance = 0.75;
	const minimumTurnRadius = 4.5;
	const lateralSpeed = 4;
	const movementBoundarySoftness = 3;
	const dragSensitivity = 0.08;
	let angularVelocity = 0;
	let movementVelocity = 0;
	let dragTurnInput = 0;
	let dragMoveInput = 0;
	let isDragging = false;
	let lastPointerX = 0;
	let lastPointerY = 0;

	const turnSmoothness = 3;
	const movementSmoothness = 3;

	const worldCameraPosition = new Vector3();
	const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

	let pivot = $state.raw<Group | undefined>(undefined);
	let camera = $state.raw<Group | undefined>(undefined);
	let viewerCamera = $state.raw<PerspectiveCamera>();
	let orbitStartPosition = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartRotation = $state<[number, number, number]>([0, 0, 0]);
	let orbitMarker = $state.raw<Mesh>();
	let orbitDirection = $state.raw<Group>();

	const orbitWorldPosition = new Vector3();
	const orbitWorldRotation = new Quaternion();
	const orbitEuler = new Euler();

	$effect(() => {
		if (!orbitDebug.enabled || !viewerCamera) return;

		viewerCamera.getWorldPosition(orbitWorldPosition);
		viewerCamera.getWorldQuaternion(orbitWorldRotation);
		orbitEuler.setFromQuaternion(orbitWorldRotation, 'YXZ');
		orbitStartPosition = [orbitWorldPosition.x, orbitWorldPosition.y, orbitWorldPosition.z];
		orbitStartRotation = [orbitEuler.x, orbitEuler.y, orbitEuler.z];
	});

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

	onMount(() => {
		const onPointerDown = (event: PointerEvent) => {
			if (
				orbitDebug.enabled ||
				event.button !== 0 ||
				!(event.target instanceof HTMLCanvasElement)
			)
				return;

			isDragging = true;
			lastPointerX = event.clientX;
			lastPointerY = event.clientY;
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!isDragging) return;

			dragTurnInput = clamp((lastPointerX - event.clientX) * dragSensitivity, -1, 1);
			dragMoveInput = clamp((event.clientY - lastPointerY) * dragSensitivity, -1, 1);
			lastPointerX = event.clientX;
			lastPointerY = event.clientY;
		};

		const stopDragging = () => (isDragging = false);

		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', stopDragging);
		window.addEventListener('pointercancel', stopDragging);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', stopDragging);
			window.removeEventListener('pointercancel', stopDragging);
		};
	});

	useTask(
		(delta) => {
			if (!pivot || !camera) return;

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
			turnDirection = clamp(turnDirection + dragTurnInput, -1, 1);
			moveDirection = clamp(moveDirection + dragMoveInput, -1, 1);
			dragTurnInput = damp(dragTurnInput, 0, 16, delta);
			dragMoveInput = damp(dragMoveInput, 0, 16, delta);

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
			if (orbitDebug.enabled) orbitMarker?.position.copy(worldCameraPosition);
			if (orbitDebug.enabled && viewerCamera) {
				viewerCamera.getWorldQuaternion(orbitWorldRotation);
				orbitDirection?.position.copy(worldCameraPosition);
				orbitDirection?.quaternion.copy(orbitWorldRotation);
			}

			cameraPosition = [worldCameraPosition.x, worldCameraPosition.y, worldCameraPosition.z];
			cameraRotation = pivot.rotation.y;
		},
		{ after: keyboard.task }
	);
</script>

	<T.Group bind:ref={pivot} rotation.y={degreesToRadians(cameraStartRotation)}>
	<T.Group bind:ref={camera} position={[0, 0, -turnPivotDistance]}>
		<T.PerspectiveCamera bind:ref={viewerCamera} makeDefault fov={45} />
	</T.Group>
</T.Group>

{#if orbitDebug.enabled}
	<T.PerspectiveCamera
		makeDefault
		position={orbitStartPosition}
		rotation={orbitStartRotation}
		fov={45}
	>
		<OrbitControls enableDamping enableKeys={false} target.y={0} />
	</T.PerspectiveCamera>

	<T.Mesh bind:ref={orbitMarker} position={orbitStartPosition}>
		<T.SphereGeometry args={[0.2, 32, 16]} />
		<T.MeshBasicMaterial color="red" />
	</T.Mesh>

	<T.Group bind:ref={orbitDirection} position={orbitStartPosition} rotation={orbitStartRotation}>
		<T.Mesh position={[0, 0, -0.38]} rotation={[-Math.PI / 2, 0, 0]}>
			<T.ConeGeometry args={[0.09, 0.32, 16]} />
			<T.MeshBasicMaterial color="red" />
		</T.Mesh>
	</T.Group>
{/if}
