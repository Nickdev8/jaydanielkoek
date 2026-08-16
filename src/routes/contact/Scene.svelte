<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { T, useTask } from '@threlte/core';
	import { GLTF, HTML, OrbitControls, type ThrelteGltf, useDraco } from '@threlte/extras';
	import type { Material, Mesh, PerspectiveCamera } from 'three';
	import { damp } from 'three/src/math/MathUtils.js';
	import { orbitDebug } from '$lib/debug/orbit.svelte';

	let { onready }: { onready?: () => void } = $props();

	const frontCameraPosition: [number, number, number] = [-0.01, 0.048, -0.4];
	const viewerCameraFov = 10;
	const entryCameraPosition: [number, number, number] = [0.04, 0.07, -0.65];
	const entryCameraFov = 18;
	const entranceSpeed = 1.5;
	const maximumEntranceDelta = 1 / 30;
	const filmEntryStartPosition: [number, number, number] = [0.7, 0, 0];
	const filmEntryTargetPosition: [number, number, number] = [0, 0, 0];
	const filmMoveStartDistance = 0.098;
	const filmEntranceSpeed = 2;
	const contactEmail = env.PUBLIC_CONTACT_EMAIL;
	const contactPhone = env.PUBLIC_CONTACT_PHONE;
	const dracoLoader = useDraco('/draco/');
	let viewerCamera = $state.raw<PerspectiveCamera>();
	let orbitStartPosition = $state<[number, number, number]>(frontCameraPosition);
	let orbitStartRotation = $state<[number, number, number]>([0, 0, 0]);
	let orbitStartFov = $state(45);
	let orbitMarker = $state.raw<Mesh>();
	let openFilmCameraGltf = $state<ThrelteGltf>();
	let filmGltf = $state<ThrelteGltf>();
	let animatedFilmPosition = $state<[number, number, number]>(filmEntryStartPosition);
	let hasLoaded = false;
	let enterScene = false;

	const configureMaterials = (gltf: ThrelteGltf) => {
		gltf.scene.traverse((object) => {
			const mesh = object as Mesh;
			if (!mesh.isMesh) return;

			const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
			for (const material of materials as Material[]) {
				material.alphaHash = true;
				material.transparent = false;
				material.depthWrite = true;
				material.needsUpdate = true;
			}
		});
	};

	$effect(() => {
		if (!orbitDebug.enabled || !viewerCamera) return;

		orbitStartPosition = [
			viewerCamera.position.x,
			viewerCamera.position.y,
			viewerCamera.position.z
		];
		orbitStartRotation = [
			viewerCamera.rotation.x,
			viewerCamera.rotation.y,
			viewerCamera.rotation.z
		];
	});

	$effect(() => {
		if (openFilmCameraGltf) configureMaterials(openFilmCameraGltf);
		if (filmGltf) configureMaterials(filmGltf);
		if (hasLoaded || !openFilmCameraGltf || !filmGltf) return;

		hasLoaded = true;
		enterScene = true;
		onready?.();
	});

	useTask((delta) => {
		if (!enterScene || !viewerCamera) return;

		const animationDelta = Math.min(delta, maximumEntranceDelta);
		viewerCamera.position.x = damp(
			viewerCamera.position.x,
			frontCameraPosition[0],
			entranceSpeed,
			animationDelta
		);
		viewerCamera.position.y = damp(
			viewerCamera.position.y,
			frontCameraPosition[1],
			entranceSpeed,
			animationDelta
		);
		viewerCamera.position.z = damp(
			viewerCamera.position.z,
			frontCameraPosition[2],
			entranceSpeed,
			animationDelta
		);
		viewerCamera.fov = damp(viewerCamera.fov, viewerCameraFov, entranceSpeed, animationDelta);
		viewerCamera.updateProjectionMatrix();

		const cameraDistanceToFinal = Math.hypot(
			viewerCamera.position.x - frontCameraPosition[0],
			viewerCamera.position.y - frontCameraPosition[1],
			viewerCamera.position.z - frontCameraPosition[2]
		);
		if (cameraDistanceToFinal > filmMoveStartDistance) return;

		animatedFilmPosition = [
			damp(animatedFilmPosition[0], filmEntryTargetPosition[0], filmEntranceSpeed, animationDelta),
			damp(animatedFilmPosition[1], filmEntryTargetPosition[1], filmEntranceSpeed, animationDelta),
			damp(animatedFilmPosition[2], filmEntryTargetPosition[2], filmEntranceSpeed, animationDelta)
		];
	});
</script>

<T.PerspectiveCamera
	bind:ref={viewerCamera}
	makeDefault
	position={entryCameraPosition}
	rotation={[0, Math.PI, 0]}
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
{/if}

<T.AmbientLight intensity={0.35} />
<T.DirectionalLight color="#d7eef0" position={[-3, 4, -4]} intensity={2.8} />
<T.DirectionalLight color="#77979a" position={[4, 1.5, -3]} intensity={1.2} />

<GLTF
	url="/models/FilmCamera-optimized.glb"
	bind:gltf={openFilmCameraGltf}
	{dracoLoader}
	position={[0, 0, 0]}
	scale={1.5}
/>

<T.Group position={animatedFilmPosition} scale={1.5}>
	<GLTF url="/models/Film.glb" bind:gltf={filmGltf} />

	<HTML
		transform
		center
		occlude={openFilmCameraGltf ? [openFilmCameraGltf.scene] : false}
		position={[-0.008, 0.032, -0.02]}
		rotation={[0, Math.PI, 0]}
		pointerEvents="auto"
	>
		<div class="film-ui">
			<div class="film-details">
				<p class="film-name">Jayden Daniel Koek</p>
				<p class="film-detail">{contactEmail}</p>
				<p class="film-detail">{contactPhone}</p>
			</div>
			<a class="email-button" href={`mailto:${contactEmail}`}>Send email</a>
		</div>
	</HTML>
</T.Group>

<style>
	.film-ui {
		width: 250px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1em;
		color: #f5f7f2;
		font-family: system-ui, sans-serif;
		font-size: 14px;
		line-height: 1.45;
		transform: scale(0.01);
		transform-origin: center;
	}
	.film-details {
		text-align: left;
	}
	.film-name,
	.film-detail {
		margin: 0;
	}
	.film-name {
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.film-detail {
		color: rgba(245, 247, 242, 0.76);
		font-size: 0.85em;
	}
	.film-detail + .film-detail {
		margin-top: 0.12em;
	}
	.email-button {
		flex: none;
		display: block;
		padding: 0.4em 0.75em;
		border: 1px solid currentColor;
		border-radius: 3px;
		color: inherit;
		text-decoration: none;
		transition: background-color 160ms ease, color 160ms ease;
	}
	.email-button:hover,
	.email-button:focus-visible {
		background: #f5f7f2;
		color: #161a1a;
	}
	.email-button:focus-visible {
		outline: 1px solid #f5f7f2;
		outline-offset: 3px;
	}
</style>
