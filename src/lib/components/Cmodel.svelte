<script lang="ts">
	import { GLTF, type ThrelteGltf } from '@threlte/extras';
	import type { Material, Mesh } from 'three';


	let {
		position = [0, 0, 0],
		rotationDegrees = [0, 0, 0],
		lens = 0,
		scale = 1,
		onready
	}: {
		position?: [number, number, number];
		rotationDegrees?: [number, number, number];
		lens?: number;
		scale?: number;
		onready?: () => void;
	} = $props();

	const rotation = $derived(
		rotationDegrees.map((degrees) => (degrees * Math.PI) / 180) as [number, number, number]
	);

	let cmodelGltf = $state<ThrelteGltf>();
	let lensGltf = $state<ThrelteGltf>();
	let bodySettled = $state(false);
	let lensSettled = $state(false);
	let hasLoaded = false;

	const showBody = $derived(lens >= 0);
	const lensNumber = $derived(Math.abs(lens));
	const showLens = $derived(lensNumber > 0);
	const lensModel = $derived(`/models/cmodel-lens${lensNumber}.glb`);

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

	const reportReady = () => {
		if (hasLoaded || (showBody && !bodySettled) || (showLens && !lensSettled)) return;

		hasLoaded = true;
		onready?.();
	};

	const onBodyLoad = (gltf: ThrelteGltf) => {
		configureMaterials(gltf);
		bodySettled = true;
		reportReady();
	};

	const onLensLoad = (gltf: ThrelteGltf) => {
		configureMaterials(gltf);
		lensSettled = true;
		reportReady();
	};

	const onModelError = (model: 'body' | 'lens', error: Error) => {
		console.error(`[Cmodel] Could not load the ${model} model.`, error);

		if (model === 'body') bodySettled = true;
		else lensSettled = true;

		reportReady();
	};

	$effect(() => {
		if (cmodelGltf) configureMaterials(cmodelGltf);
		if (lensGltf) configureMaterials(lensGltf);
	});
</script>

{#if showBody}
	<GLTF
		url="/models/cmodel.glb"
		bind:gltf={cmodelGltf}
		{position}
		{rotation}
		{scale}
		onload={onBodyLoad}
		onerror={(error) => onModelError('body', error)}
	/>
{/if}

{#if showLens}
	<GLTF
		url={lensModel}
		bind:gltf={lensGltf}
		{position}
		{rotation}
		{scale}
		onload={onLensLoad}
		onerror={(error) => onModelError('lens', error)}
	/>
{/if}
