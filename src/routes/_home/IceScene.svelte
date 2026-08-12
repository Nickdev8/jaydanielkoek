<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Group } from 'three';

	const random = (seed: number) => {
		const value = Math.sin(seed * 918.247) * 43758.5453;
		return value - Math.floor(value);
	};

	const crystals = Array.from({ length: 26 }, (_, index) => {
		const angle = random(index + 1) * Math.PI * 2;
		const radius = 0.45 + random(index + 31) * 4.5;

		return {
			id: index,
			position: [
				Math.cos(angle) * radius,
				-1.1 + random(index + 61) * 0.28,
				Math.sin(angle) * radius
			] as [number, number, number],
			rotation: [
				random(index + 91) * 0.35,
				random(index + 121) * Math.PI,
				random(index + 151) * 0.35
			] as [number, number, number],
			scale: [
				0.25 + random(index + 181) * 0.55,
				0.06 + random(index + 211) * 0.2,
				0.25 + random(index + 241) * 0.55
			] as [number, number, number],
			opacity: 0.08 + random(index + 271) * 0.18
		};
	});

	const iceDust = Array.from({ length: 46 }, (_, index) => ({
		id: index,
		position: [
			-7 + random(index + 301) * 14,
			-0.8 + random(index + 331) * 4.5,
			-5 + random(index + 361) * 7
		] as [number, number, number],
		size: 0.008 + random(index + 391) * 0.025,
		opacity: 0.08 + random(index + 421) * 0.2
	}));

	let ice = $state.raw<Group>();
	let elapsed = 0;

	useTask((delta) => {
		elapsed += delta;
		if (ice) ice.rotation.y = Math.sin(elapsed * 0.08) * 0.08;
	});
</script>

<T.Color attach="background" args={['#02080d']} />
<T.FogExp2 attach="fog" args={['#02080d', 0.12]} />

<T.PerspectiveCamera makeDefault position={[0, 1.3, 7]} fov={48} />

<T.HemisphereLight args={['#177c96', '#020407', 0.65]} />
<T.DirectionalLight color="#74e8ff" intensity={1.2} position={[-4, 6, 2]} />
<T.PointLight color="#00b7de" intensity={8} distance={12} decay={2} position={[-1.5, 0.4, 1]} />
<T.PointLight color="#08758f" intensity={5} distance={10} decay={2} position={[4, -0.3, -2]} />

<T.Mesh position={[0, -1.25, -1.5]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[34, 34]} />
	<T.MeshStandardMaterial color="#03131a" metalness={0.72} roughness={0.23} />
</T.Mesh>

<T.Group bind:ref={ice}>
	<T.Mesh position={[0, -1.19, -0.8]} rotation.x={-Math.PI / 2}>
		<T.CircleGeometry args={[4.8, 96]} />
		<T.MeshPhysicalMaterial
			color="#07333e"
			metalness={0.62}
			roughness={0.12}
			transparent
			opacity={0.72}
		/>
	</T.Mesh>

	{#each crystals as crystal (crystal.id)}
		<T.Mesh position={crystal.position} rotation={crystal.rotation} scale={crystal.scale}>
			<T.IcosahedronGeometry args={[1, 1]} />
			<T.MeshPhysicalMaterial
				color="#196b79"
				metalness={0.35}
				roughness={0.18}
				transparent
				opacity={crystal.opacity}
			/>
		</T.Mesh>
	{/each}
</T.Group>

{#each iceDust as particle (particle.id)}
	<T.Mesh position={particle.position}>
		<T.SphereGeometry args={[particle.size, 8, 6]} />
		<T.MeshBasicMaterial
			color="#c5f8ff"
			transparent
			opacity={particle.opacity}
			depthWrite={false}
		/>
	</T.Mesh>
{/each}
