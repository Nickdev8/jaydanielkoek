<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { ContactShadows } from '@threlte/extras';
	import type { ShowcaseCategory } from '$lib/showcase/categories';

	import SandFloor from './SandFloor.svelte';
	import CameraController from './CameraController.svelte';
	import PosterController from './PosterController.svelte';
	let { category }: { category: ShowcaseCategory } = $props();
	const distanceByStep = [0, 5.63, 13, 20, 27];
	const backgroundColor = '#080c15';
	const fogDensity = 0.075;
	const cameraStartRotation = 0;
	const floorHeight = -1.4;
	const maximumCameraDistance = Math.max(...distanceByStep.slice(1)) + 2;

	let cameraPosition = $state<[number, number, number]>([0, 0, 0]);
	let cameraRotation = $state(0);
	let dustDrift = $state(0);

	const dust = Array.from({ length: 54 }, (_, index) => {
		const random = (seed: number) => {
			const value = Math.sin(seed * 527.327) * 9157.131;
			return value - Math.floor(value);
		};

		return {
			id: index,
			x: -16 + random(index + 1) * 32,
			y: -0.5 + random(index + 51) * 8,
			z: -2 - random(index + 101) * 18,
			size: 0.014 + random(index + 151) * 0.036,
			opacity: 0.18 + random(index + 201) * 0.24
		};
	});

	useTask((delta) => {
		dustDrift = (dustDrift + delta * 0.32) % 8;
	});
</script>

<T.Color attach="background" args={[backgroundColor]} />
<T.FogExp2 attach="fog" args={[backgroundColor, fogDensity]} />

<CameraController
	{maximumCameraDistance}
	{cameraStartRotation}
	bind:cameraPosition
	bind:cameraRotation
/>

<T.Group
	position={[cameraPosition[0] + dustDrift - 4, cameraPosition[1], cameraPosition[2]]}
	rotation.y={cameraRotation * 0.5}
>
	{#each dust as particle (particle.id)}
		<T.Mesh position={[particle.x, particle.y, particle.z]}>
			<T.SphereGeometry args={[particle.size, 8, 6]} />
			<T.MeshBasicMaterial
				color="#e9e0d0"
				transparent
				opacity={particle.opacity}
				depthWrite={false}
			/>
		</T.Mesh>
	{/each}
</T.Group>

<!-- <Grid
	position.y={floorHeight - 0.01}
	gridSize={[100, 100]}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/> -->

<SandFloor {floorHeight} radius={100} {backgroundColor} {fogDensity} />

<T.Mesh position={[0, floorHeight + 0.01, 0]} rotation.x={-Math.PI / 2}>
	<T.CircleGeometry args={[3, 64]} />
	<T.MeshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} />
</T.Mesh>

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />

<PosterController
	{floorHeight}
	posters={category.posters}
	{distanceByStep}
	{cameraPosition}
	{backgroundColor}
	{fogDensity}
/>
