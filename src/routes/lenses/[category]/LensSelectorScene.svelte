<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { ContactShadows, OrbitControls } from '@threlte/extras';
	import { untrack } from 'svelte';
	import { damp } from 'three/src/math/MathUtils.js';
	import { PerspectiveCamera, Vector3, type Group, type Mesh } from 'three';
	import Cmodel from '$lib/components/Cmodel.svelte';
	import { orbitDebug } from '$lib/debug/orbit.svelte';
	import type { ShowcaseCategory } from '$lib/showcase/types';

	let {
		currentCategory,
		categories,
		selectedLens = $bindable(),
		attachRequested = false,
		ready = false,
		onmodelready,
		onlensselected,
		onattached
	}: {
		currentCategory: ShowcaseCategory;
		categories: ShowcaseCategory[];
		selectedLens?: number;
		attachRequested?: boolean;
		ready?: boolean;
		onmodelready?: (modelKey: string) => void;
		onlensselected?: (lens: number) => void;
		onattached?: (categoryId: string) => void;
	} = $props();

	const modelScale = 6;
	const selectorModelRotation: [number, number, number] = [0, 180, 0];
	const selectorModelPosition: [number, number, number] = [0, 0, 0.3];
	const carouselSpacing = 0.5;
	const carouselLift = 0.12;
	const carouselDepth = -0.2;
	const carouselSpeed = 7;
	const attachSpeed = 5;
	const cameraSpeed = 3.5;
	const entryCameraPosition: [number, number, number] = [0, 0.5, 4.5];
	const topDownCameraPosition: [number, number, number] = [0, 3, 0];
	const cameraLookAt: [number, number, number] = [0, 0.18, 0];
	const entryCameraFov = 36;
	const topDownCameraFov = 30;
	const maximumDelta = 1 / 30;
	const atmosphereDust = Array.from({ length: 34 }, (_, index) => {
		const random = (seed: number) => {
			const value = Math.sin(seed * 913.71) * 5172.19;
			return value - Math.floor(value);
		};

		return {
			id: index,
		x: -1.5 + random(index + 1) * 3,
		y: 0.018 + random(index + 31) * 0.065,
		z: -1.1 + random(index + 61) * 2.2,
		size: 0.002 + random(index + 91) * 0.005,
			opacity: 0.035 + random(index + 121) * 0.06
		};
	});

	type SelectorPhase = 'entering' | 'selecting' | 'attaching';

	let phase = $state<SelectorPhase>('entering');
	let viewerCamera = $state.raw<PerspectiveCamera>();
	let orbitStartPosition = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartRotation = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartFov = $state(entryCameraFov);
	let orbitMarker = $state.raw<Mesh>();
	let orbitDirection = $state.raw<Group>();

	const initialCategoryIndex = untrack(() =>
		Math.max(0, categories.findIndex((category) => category.lens === currentCategory.lens))
	);
	let carouselOffset = $state(-initialCategoryIndex * carouselSpacing);
	let attachingLensPosition = $state<[number, number, number]>([
		selectorModelPosition[0],
		selectorModelPosition[1] + carouselLift,
		selectorModelPosition[2] + carouselDepth
	]);
	let hasReportedAttach = false;
	let atmosphereTime = $state(0);

	const targetCamera = new PerspectiveCamera();
	const targetLookAt = new Vector3(...cameraLookAt);
	const targetPosition = new Vector3(...topDownCameraPosition);
	const attachmentTarget = new Vector3(...selectorModelPosition);
	const attachmentVector = new Vector3();

	const activeLens = $derived(selectedLens ?? currentCategory.lens);
	const selectedIndex = $derived(
		Math.max(0, categories.findIndex((category) => category.lens === activeLens))
	);
	const selectedCategory = $derived(categories.find((category) => category.lens === activeLens));
	const targetCarouselOffset = $derived(-selectedIndex * carouselSpacing);

	const moveViewerCamera = (delta: number) => {
		if (!viewerCamera) return;

		viewerCamera.position.x = damp(
			viewerCamera.position.x,
			topDownCameraPosition[0],
			cameraSpeed,
			delta
		);
		viewerCamera.position.y = damp(
			viewerCamera.position.y,
			topDownCameraPosition[1],
			cameraSpeed,
			delta
		);
		viewerCamera.position.z = damp(
			viewerCamera.position.z,
			topDownCameraPosition[2],
			cameraSpeed,
			delta
		);
		viewerCamera.fov = damp(viewerCamera.fov, topDownCameraFov, cameraSpeed, delta);
		targetCamera.position.copy(targetPosition);
		targetCamera.lookAt(targetLookAt);
		viewerCamera.quaternion.slerp(targetCamera.quaternion, 1 - Math.exp(-cameraSpeed * delta));
		viewerCamera.updateProjectionMatrix();
	};

	const isCameraSettled = () =>
		Boolean(
			viewerCamera &&
			viewerCamera.position.distanceTo(targetPosition) < 0.015 &&
			Math.abs(viewerCamera.fov - topDownCameraFov) < 0.05
		);

	const isCarouselSettled = () => Math.abs(carouselOffset - targetCarouselOffset) < 0.003;

	const startAttachment = () => {
		attachingLensPosition = [
			selectorModelPosition[0] + carouselOffset + selectedIndex * carouselSpacing,
			selectorModelPosition[1] + carouselLift,
			selectorModelPosition[2] + carouselDepth
		];
		phase = 'attaching';
	};

	$effect(() => {
		if (!orbitDebug.enabled || !viewerCamera) return;

		orbitStartPosition = [viewerCamera.position.x, viewerCamera.position.y, viewerCamera.position.z];
		orbitStartRotation = [viewerCamera.rotation.x, viewerCamera.rotation.y, viewerCamera.rotation.z];
		orbitStartFov = viewerCamera.fov;
	});

	useTask((delta) => {
		if (!viewerCamera) return;
		atmosphereTime += delta;
		if (!ready) return;
		const animationDelta = Math.min(delta, maximumDelta);

		moveViewerCamera(animationDelta);
		if (phase !== 'attaching') {
			carouselOffset = damp(
				carouselOffset,
				targetCarouselOffset,
				carouselSpeed,
				animationDelta
			);
		}

		if (orbitDebug.enabled) {
			orbitMarker?.position.copy(viewerCamera.position);
			orbitDirection?.position.copy(viewerCamera.position);
			orbitDirection?.quaternion.copy(viewerCamera.quaternion);
		}

		if (phase === 'entering' && isCameraSettled()) {
			phase = 'selecting';
		}

		if (phase === 'selecting' && attachRequested && isCarouselSettled()) {
			startAttachment();
		}

		if (phase !== 'attaching') return;

		attachingLensPosition = [
			damp(attachingLensPosition[0], attachmentTarget.x, attachSpeed, animationDelta),
			damp(attachingLensPosition[1], attachmentTarget.y, attachSpeed, animationDelta),
			damp(attachingLensPosition[2], attachmentTarget.z, attachSpeed, animationDelta)
		];

		if (
			!hasReportedAttach &&
			attachmentVector.set(...attachingLensPosition).distanceTo(attachmentTarget) < 0.008 &&
			selectedCategory
		) {
			hasReportedAttach = true;
			onattached?.(selectedCategory.id);
		}
	});
</script>

<T.Color attach="background" args={['#ffffff']} />
<T.HemisphereLight args={['#ffffff', '#d9e5e6', 1.7]} />
<T.DirectionalLight color="#ffffff" position={[3, 3, 4]} intensity={4.2} />
<T.DirectionalLight color="#b6e1e8" position={[-4, 2.5, -2]} intensity={1.8} />
<T.PointLight color="#ffd6b5" position={[1, 0.2, -0.5]} intensity={40} distance={1} decay={1} />
<T.PointLight color="#9edce7" position={[-1, 0.2, 0.5]} intensity={40} distance={1} decay={1} />
<!-- A broad studio reflection that slowly crosses the lenses from the top-down view. -->
<T.PointLight
	color="#ffffff"
	position={[Math.sin(atmosphereTime * 0.22) * 1.35, 2.7, Math.cos(atmosphereTime * 0.22) * 1.05]}
	intensity={1.7}
	distance={3.8}
	decay={2}
/>

<T.PerspectiveCamera
	bind:ref={viewerCamera}
	makeDefault
	position={entryCameraPosition}
	fov={entryCameraFov}
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

<T.Mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
	<T.PlaneGeometry args={[60, 60]} />
	<T.MeshStandardMaterial color="#f5f5f1" roughness={0.82} metalness={0.02} />
</T.Mesh>

<!-- Near-invisible airborne dust gives the empty studio surface a little depth. -->
<T.Group position={[Math.sin(atmosphereTime * 0.08) * 0.035, 0, 0]}>
	{#each atmosphereDust as dust (dust.id)}
		<T.Mesh position={[dust.x, dust.y, dust.z]}>
			<T.SphereGeometry args={[dust.size, 6, 4]} />
			<T.MeshBasicMaterial color="#95a3a2" transparent opacity={dust.opacity} depthWrite={false} />
		</T.Mesh>
	{/each}
</T.Group>

<Cmodel
	position={selectorModelPosition}
	rotationDegrees={selectorModelRotation}
	lens={0}
	scale={modelScale}
	onready={() => onmodelready?.('body')}
/>

{#if phase !== 'attaching'}
	<T.Group
		position={[
			selectorModelPosition[0] + carouselOffset,
			selectorModelPosition[1],
			selectorModelPosition[2]
		]}
	>
		{#each categories as category, index (category.id)}
			<T.Group
				position={[index * carouselSpacing, carouselLift, carouselDepth]}
				onclick={() => onlensselected?.(category.lens)}
			>
				<Cmodel
					lens={-category.lens}
					rotationDegrees={selectorModelRotation}
					scale={modelScale}
					onready={() => onmodelready?.(`lens-${category.lens}`)}
				/>
			</T.Group>
		{/each}
	</T.Group>
{:else}
	<T.Group
		position={[
			selectorModelPosition[0] + carouselOffset,
			selectorModelPosition[1],
			selectorModelPosition[2]
		]}
	>
		{#each categories as category, index (category.id)}
			{#if category.lens !== activeLens}
				<T.Group position={[index * carouselSpacing, carouselLift, carouselDepth]}>
					<Cmodel
						lens={-category.lens}
						rotationDegrees={selectorModelRotation}
						scale={modelScale}
						onready={() => onmodelready?.(`lens-${category.lens}`)}
					/>
				</T.Group>
			{/if}
		{/each}
	</T.Group>

	<Cmodel
		lens={-activeLens}
		position={attachingLensPosition}
		rotationDegrees={selectorModelRotation}
		scale={modelScale}
		onready={() => onmodelready?.(`lens-${activeLens}`)}
	/>
{/if}

<ContactShadows position={[0, -0.01, 0]} scale={20} blur={3} far={10} opacity={0.32} />
