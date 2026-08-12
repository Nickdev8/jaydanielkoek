<script lang="ts">
	import { T } from '@threlte/core';
	import { ContactShadows, OrbitControls } from '@threlte/extras';

	import SandFloor from './SandFloor.svelte';
	import CameraController from './CameraController.svelte';
	import PosterController from './PosterController.svelte';
	import DustField from './DustField.svelte';

	import type { ShowcaseDefinition } from '$lib/types/showcase';

	let {
		showcase,
		cameraRotation = $bindable(0)
	}: {
		showcase: ShowcaseDefinition;
		cameraRotation?: number;
	} = $props();

	let posters = $derived(showcase.posters);
	let distanceByStep = $derived(showcase.distanceByStep);
	let backgroundColor = $derived(showcase.backgroundColor);
	let fogDensity = $derived(showcase.fogDensity);
	let cameraStartRotation = $derived(showcase.cameraStartRotation ?? 0);
	let floorHeight = $derived(showcase.floorHeight ?? -1.4);
	let maximumCameraDistance = $derived(Math.max(...distanceByStep.slice(1)) + 2);

	let cameraPosition = $state<[number, number, number]>([0, 0, 0]);
</script>

<T.Color attach="background" args={[backgroundColor]} />
<T.FogExp2 attach="fog" args={[backgroundColor, fogDensity]} />

<CameraController
	{maximumCameraDistance}
	{cameraStartRotation}
	bind:cameraPosition
	bind:cameraRotation
/>

<DustField {cameraPosition} {cameraRotation} />

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

<PosterController
	{floorHeight}
	{posters}
	{distanceByStep}
	{cameraPosition}
	{backgroundColor}
	{fogDensity}
/>
