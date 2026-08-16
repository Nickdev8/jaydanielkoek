<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { damp } from 'three/src/math/MathUtils.js';
	import { Color, Euler, Quaternion, Vector3, type Group, type Mesh, type PerspectiveCamera } from 'three';
	import Cmodel from '$lib/components/Cmodel.svelte';
	import ReflectiveSurface from '$lib/components/ReflectiveSurface.svelte';
	import { orbitDebug } from '$lib/debug/orbit.svelte';

	let {
		started = false,
		onarrive,
		onready
	}: {
		started?: boolean;
		onarrive?: () => void;
		onready?: () => void;
	} = $props();

	let startPosition: [number, number, number] = [-0.9, 0.05, 2.2];
	let targetPosition: [number, number, number] = [0.01, 0.18, 0.3];

	let startRotation: [number, number, number] = [0.07, -0.2, 0];
	let targetRotation: [number, number, number] = [0, 0, 0];
	let startFov = 30;
	let targetFov = 40;

	let cmodelStartRotation = 7;
	let cmodelTargetRotation = 180;
	let speed = 4;
	let reflectorPosition: [number, number, number] = [0, 0, 0];
	const backgroundColor = '#033542';

	let viewerCamera = $state.raw<PerspectiveCamera>();
	let orbitStartPosition = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartRotation = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartFov = $state(startFov);
	let orbitMarker = $state.raw<Mesh>();
	let orbitDirection = $state.raw<Group>();
	let hasArrived = false;
	let cmodelRotation = $state(cmodelStartRotation);
	const targetVector = new Vector3();
	const targetQuaternion = new Quaternion();
	const { renderer, scene } = useThrelte();
	const sceneBackground = new Color(backgroundColor);

	$effect(() => {
		scene.background = sceneBackground;
		renderer.setClearColor(sceneBackground, 1);
	});

	$effect(() => {
		if (!viewerCamera) return;

		viewerCamera.rotation.order = 'YXZ';
	});

	$effect(() => {
		if (!orbitDebug.enabled || !viewerCamera) return;

		orbitStartPosition = [viewerCamera.position.x, viewerCamera.position.y, viewerCamera.position.z];
		orbitStartRotation = [viewerCamera.rotation.x, viewerCamera.rotation.y, viewerCamera.rotation.z];
		orbitStartFov = viewerCamera.fov;
	});

	useTask((delta) => {
		if (!started || !viewerCamera || hasArrived) return;

		viewerCamera.position.x = damp(viewerCamera.position.x, targetPosition[0], speed, delta);
		viewerCamera.position.y = damp(viewerCamera.position.y, targetPosition[1], speed, delta);
		viewerCamera.position.z = damp(viewerCamera.position.z, targetPosition[2], speed, delta);
		viewerCamera.fov = damp(viewerCamera.fov, targetFov, speed, delta);
		viewerCamera.updateProjectionMatrix();
		cmodelRotation = damp(cmodelRotation, cmodelTargetRotation, speed, delta);

		targetQuaternion.setFromEuler(new Euler(...targetRotation, 'YXZ'));
		viewerCamera.quaternion.slerp(targetQuaternion, 1 - Math.exp(-speed * delta));
		if (orbitDebug.enabled) {
			orbitMarker?.position.copy(viewerCamera.position);
			orbitDirection?.position.copy(viewerCamera.position);
			orbitDirection?.quaternion.copy(viewerCamera.quaternion);
		}

		targetVector.set(...targetPosition);

		if (
			viewerCamera.position.distanceTo(targetVector) < 0.01 &&
			viewerCamera.quaternion.angleTo(targetQuaternion) < 0.01 &&
			Math.abs(viewerCamera.fov - targetFov) < 0.01 &&
			Math.abs(cmodelRotation - cmodelTargetRotation) < 0.1
		) {
			cmodelRotation = cmodelTargetRotation;
			viewerCamera.fov = targetFov;
			viewerCamera.updateProjectionMatrix();
			hasArrived = true;
			onarrive?.();
		}
	});
</script>

<T.Color attach="background" args={[backgroundColor]} />

<T.DirectionalLight color="#65a2ba" position={[3, 4, 5]} intensity={3.4} />
<T.DirectionalLight color="#0b6b7b" position={[-4, 1, -1]} intensity={3.2} />

	<T.PerspectiveCamera
		bind:ref={viewerCamera}
		makeDefault
		position={startPosition}
		rotation={startRotation}
		fov={startFov}
	/>

{#if orbitDebug.enabled}
	<T.PerspectiveCamera
		makeDefault
		position={orbitStartPosition}
		rotation={orbitStartRotation}
		fov={orbitStartFov}
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

<ReflectiveSurface position={reflectorPosition} {backgroundColor} />

<Cmodel
	position={[0, 0, 0]}
	rotationDegrees={[0, cmodelRotation, 0]}
	lens={2}
	scale={6}
	{onready}
/>
