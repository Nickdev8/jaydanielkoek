<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { GLTF, useDraco, type ThrelteGltf } from '@threlte/extras';
	import { Box3, Vector3, type Mesh } from 'three';

	let { onready, onerror }: { onready: () => void; onerror: () => void } = $props();
	const { renderer, invalidate } = useThrelte();
	const dracoLoader = useDraco('/draco/');
	let body: ThrelteGltf | undefined;
	let lens: ThrelteGltf | undefined;
	let ready = $state(false);
	let scale = $state(1);
	let position = $state<[number, number, number]>([0, 0, 0]);
	let floorY = $state(-0.9);

	renderer.setClearColor(0x000000, 0);

	function configureMaterials(gltf: ThrelteGltf) {
		gltf.scene.traverse((object) => {
			const mesh = object as Mesh;
			if (!mesh.isMesh) return;
			for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
				material.alphaHash = true;
				material.transparent = false;
				material.depthWrite = true;
				material.needsUpdate = true;
			}
			mesh.castShadow = true;
		});
	}

	function frameModel() {
		if (!body || !lens || ready) return;
		// Both files share the same model origin; frame them together before scaling the group.
		const bounds = new Box3().setFromObject(body.scene).union(new Box3().setFromObject(lens.scene));
		const center = bounds.getCenter(new Vector3());
		const modelScale = 2.4 / bounds.getSize(new Vector3()).x;
		scale = modelScale;
		position = [-center.x * modelScale, -center.y * modelScale, -center.z * modelScale];
		floorY = (bounds.min.y - center.y) * modelScale - 0.06;
		ready = true;
		invalidate();
		onready();
	}
</script>

<T.PerspectiveCamera makeDefault position={[0, -0.15, 4.8]} fov={35} />
<T.HemisphereLight args={['#ffffff', '#b6afa3', 2]} />
<T.DirectionalLight castShadow position={[3, 4, 5]} intensity={4} color="#fff7ec" />
<T.DirectionalLight position={[-4, 1, 3]} intensity={2.5} color="#ffffff" />
<T.DirectionalLight position={[0, 3, -4]} intensity={3} color="#ffffff" />

<T.Group rotation.y={Math.PI / 13}>
	<T.Group {scale} {position} visible={ready}>
		<GLTF
			url="/models/cmodel-optimized.glb"
			{dracoLoader}
			onload={(gltf) => {
				configureMaterials(gltf);
				body = gltf;
				frameModel();
			}}
			{onerror}
		/>
		<GLTF
			url="/models/cmodel-lens2-optimized.glb"
			{dracoLoader}
			onload={(gltf) => {
				configureMaterials(gltf);
				lens = gltf;
				frameModel();
			}}
			{onerror}
		/>
	</T.Group>
</T.Group>

<T.Mesh position.y={floorY} rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[10, 10]} />
	<T.ShadowMaterial color="#514a41" opacity={0.18} />
</T.Mesh>
