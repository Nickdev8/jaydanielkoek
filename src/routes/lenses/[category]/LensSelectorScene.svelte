<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { ContactShadows, OrbitControls } from '@threlte/extras';
	import { damp } from 'three/src/math/MathUtils.js';
	import { PerspectiveCamera, Vector3, type Group, type Mesh } from 'three';
	import Cmodel from '$lib/components/Cmodel.svelte';
	import { orbitDebug } from '$lib/debug/orbit.svelte';
	import {
		getCategoryForLens,
		showcaseCategories,
		type ShowcaseCategory
	} from '$lib/showcase/categories';

	let {
		currentCategory,
		selectedLens = $bindable(),
		attachRequested = false,
		attachAfterSelection = false,
		carouselRequested = false,
		onlensselected,
		onselectionsettled,
		onattached
	}: {
		currentCategory: ShowcaseCategory;
		selectedLens?: number;
		attachRequested?: boolean;
		attachAfterSelection?: boolean;
		carouselRequested?: boolean;
		onlensselected?: (lens: number) => void;
		onselectionsettled?: () => void;
		onattached?: (categoryId: string) => void;
	} = $props();

	const modelScale = 6;
	const selectorModelRotation: [number, number, number] = [0, 180, 0];
	const selectorModelPosition: [number, number, number] = [0, 0, 0.3];
	const carouselSpacing = 0.5;
	const carouselDepth = -0.2;
	const carouselLift = 0;
	const motionSpeed = 3.5;
	const attachOverlapDistance = carouselSpacing * 0.2;
	const entryCameraPosition: [number, number, number] = [0, 0.5, 4.5];
	const topDownCameraPosition: [number, number, number] = [0, 3, 0];
	const cameraLookAt: [number, number, number] = [0, 0.18, 0];
	const topDownCameraFov = 30;

	let phase = $state<'entering' | 'framing' | 'selecting' | 'attaching'>('entering');
	let viewerCamera = $state.raw<PerspectiveCamera>();
	let orbitStartPosition = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartRotation = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartFov = $state(36);
	let orbitMarker = $state.raw<Mesh>();
	let orbitDirection = $state.raw<Group>();
	let carouselOffset = $state(0);
	let carouselSpread = $state(0);
	let attachingLensPosition = $state<[number, number, number]>([
		selectorModelPosition[0],
		selectorModelPosition[1] + carouselLift,
		selectorModelPosition[2] + carouselDepth
	]);
	let hasReportedAttach = false;
	let hasReportedSelectionSettled = false;

	const targetPosition = new Vector3();
	const targetLookAt = new Vector3(...cameraLookAt);
	const targetCamera = new PerspectiveCamera();
	const targetQuaternion = targetCamera.quaternion;
	const attachTarget = new Vector3(...selectorModelPosition);
	const attachingLensVector = new Vector3();

	const selectedIndex = $derived(
		Math.max(0, showcaseCategories.findIndex((category) => category.lens === selectedLens))
	);
	const currentCategoryIndex = showcaseCategories.findIndex(
		(category) => category.lens === currentCategory.lens
	);
	const selectedCategory = $derived(getCategoryForLens(selectedLens ?? currentCategory.lens));
	const advanceCarousel = (delta: number) => {
		carouselSpread = damp(carouselSpread, 1, motionSpeed, delta);
		carouselOffset = damp(
			carouselOffset,
			-selectedIndex * carouselSpacing,
			motionSpeed,
			delta
		);
	};

	const moveCamera = (position: [number, number, number], delta: number) => {
		if (!viewerCamera) return;

		viewerCamera.position.x = damp(viewerCamera.position.x, position[0], motionSpeed, delta);
		viewerCamera.position.y = damp(viewerCamera.position.y, position[1], motionSpeed, delta);
		viewerCamera.position.z = damp(viewerCamera.position.z, position[2], motionSpeed, delta);
		targetCamera.position.set(...position);
		targetCamera.lookAt(targetLookAt);
		viewerCamera.quaternion.slerp(targetQuaternion, 1 - Math.exp(-motionSpeed * delta));
	};

	$effect(() => {
		if (phase !== 'selecting' || !attachRequested) return;

		attachingLensPosition = [
			selectorModelPosition[0] + carouselOffset + selectedIndex * carouselSpacing,
			selectorModelPosition[1] +
				carouselLift * (selectedLens === currentCategory.lens ? carouselSpread : 1),
			selectorModelPosition[2] +
				carouselDepth * (selectedLens === currentCategory.lens ? carouselSpread : 1)
		];
		phase = 'attaching';
	});

	$effect(() => {
		if (!attachAfterSelection) hasReportedSelectionSettled = false;
	});

	$effect(() => {
		if (!carouselRequested || phase === 'selecting' || carouselSpread !== 0) return;

		carouselOffset = -currentCategoryIndex * carouselSpacing;
	});

	$effect(() => {
		if (!orbitDebug.enabled || !viewerCamera) return;

		orbitStartPosition = [viewerCamera.position.x, viewerCamera.position.y, viewerCamera.position.z];
		orbitStartRotation = [viewerCamera.rotation.x, viewerCamera.rotation.y, viewerCamera.rotation.z];
		orbitStartFov = viewerCamera.fov;
	});

	useTask((delta) => {
		if (!viewerCamera) return;
		if (orbitDebug.enabled) {
			orbitMarker?.position.copy(viewerCamera.position);
			orbitDirection?.position.copy(viewerCamera.position);
			orbitDirection?.quaternion.copy(viewerCamera.quaternion);
		}

		if (phase === 'entering') {
			moveCamera(topDownCameraPosition, delta);
			if (carouselRequested) advanceCarousel(delta);
			targetPosition.set(...topDownCameraPosition);

			if (viewerCamera.position.distanceTo(targetPosition) < 0.02) {
				phase = 'framing';
			}
			return;
		}

		if (phase === 'framing') {
			viewerCamera.fov = damp(viewerCamera.fov, topDownCameraFov, motionSpeed, delta);
			viewerCamera.updateProjectionMatrix();
			if (carouselRequested) advanceCarousel(delta);

			if (Math.abs(viewerCamera.fov - topDownCameraFov) < 0.01) {
				viewerCamera.fov = topDownCameraFov;
				viewerCamera.updateProjectionMatrix();
				if (!attachAfterSelection) carouselOffset = -currentCategoryIndex * carouselSpacing;
				phase = 'selecting';
			}
			return;
		}

		if (phase === 'selecting') {
			advanceCarousel(delta);

			if (
				attachAfterSelection &&
				!hasReportedSelectionSettled &&
				Math.abs(carouselSpread - 1) < attachOverlapDistance &&
				Math.abs(carouselOffset + selectedIndex * carouselSpacing) < attachOverlapDistance
			) {
				hasReportedSelectionSettled = true;
				onselectionsettled?.();
			}
			return;
		}

		attachingLensPosition = [
			damp(attachingLensPosition[0], attachTarget.x, motionSpeed, delta),
			damp(attachingLensPosition[1], attachTarget.y, motionSpeed, delta),
			damp(attachingLensPosition[2], attachTarget.z, motionSpeed, delta)
		];
		if (
			!hasReportedAttach &&
			attachingLensVector.set(...attachingLensPosition).distanceTo(attachTarget) < 0.03 &&
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
<T.PointLight color="#ffd6b5" position={[2.2, 1, -3]} intensity={5} distance={7} decay={2} />
<T.PointLight color="#9edce7" position={[-2.5, 0.8, 2]} intensity={3.2} distance={6} decay={2} />

	<T.PerspectiveCamera
	bind:ref={viewerCamera}
		makeDefault
		position={entryCameraPosition}
		fov={36}
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
	<T.MeshStandardMaterial color="#f7f7f4" roughness={0.9} />
</T.Mesh>

<Cmodel
	position={selectorModelPosition}
	rotationDegrees={selectorModelRotation}
	lens={0}
	scale={modelScale}
/>

{#if (phase === 'entering' || phase === 'framing') && !carouselRequested}
	<T.Group onclick={() => onlensselected?.(currentCategory.lens)}>
		<Cmodel
			lens={-currentCategory.lens}
			position={selectorModelPosition}
			rotationDegrees={selectorModelRotation}
			scale={modelScale}
		/>
	</T.Group>
	{#each showcaseCategories as category, index (category.id)}
		{#if category.lens !== currentCategory.lens}
			{@const lensPosition: [number, number, number] = [
				selectorModelPosition[0] + (index - currentCategoryIndex) * carouselSpacing,
				selectorModelPosition[1] + carouselLift,
				selectorModelPosition[2] + carouselDepth
			]}
			<T.Group onclick={() => onlensselected?.(category.lens)}>
				<Cmodel
					lens={-category.lens}
					position={lensPosition}
					rotationDegrees={selectorModelRotation}
					scale={modelScale}
				/>
			</T.Group>
		{/if}
	{/each}
{:else if phase !== 'attaching'}
<T.Group
	position={[
		selectorModelPosition[0] + carouselOffset,
		selectorModelPosition[1],
		selectorModelPosition[2]
	]}
>
		{#each showcaseCategories as category, index (category.id)}
			{@const lensPosition: [number, number, number] = [
				selectorModelPosition[0] + carouselOffset + index * carouselSpacing,
				selectorModelPosition[1] +
					carouselLift * (category.lens === currentCategory.lens ? carouselSpread : 1),
				selectorModelPosition[2] +
					carouselDepth * (category.lens === currentCategory.lens ? carouselSpread : 1)
			]}
			<T.Group
				position={[
					index * carouselSpacing,
					carouselLift * (category.lens === currentCategory.lens ? carouselSpread : 1),
					carouselDepth * (category.lens === currentCategory.lens ? carouselSpread : 1)
				]}
				onclick={() => onlensselected?.(category.lens)}
			>
				<Cmodel
					lens={-category.lens}
					rotationDegrees={selectorModelRotation}
					scale={modelScale}
				/>
			</T.Group>
		{/each}
	</T.Group>
{:else}
	{#each showcaseCategories as category, index (category.id)}
		{#if category.lens !== selectedLens}
			<Cmodel
				lens={-category.lens}
				position={[
					selectorModelPosition[0] + carouselOffset + index * carouselSpacing,
					selectorModelPosition[1] + carouselLift,
					selectorModelPosition[2] + carouselDepth
				]}
				rotationDegrees={selectorModelRotation}
				scale={modelScale}
			/>
		{/if}
	{/each}
	<Cmodel
		lens={-(selectedLens ?? currentCategory.lens)}
		position={attachingLensPosition}
		rotationDegrees={selectorModelRotation}
		scale={modelScale}
	/>
{/if}

<ContactShadows position={[0, -0.01, 0]} scale={20} blur={3} far={10} opacity={0.32} />
