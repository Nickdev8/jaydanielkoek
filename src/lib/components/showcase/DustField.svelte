<script lang="ts">
	import { T, useTask } from '@threlte/core';

	let {
		cameraPosition,
		cameraRotation
	}: {
		cameraPosition: [number, number, number];
		cameraRotation: number;
	} = $props();

	const particles = Array.from({ length: 54 }, (_, index) => {
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

	let drift = $state(0);

	useTask((delta) => {
		drift = (drift + delta * 0.32) % 8;
	});
</script>

<T.Group
	position={[cameraPosition[0] + drift - 4, cameraPosition[1], cameraPosition[2]]}
	rotation.y={cameraRotation * 0.5}
>
	{#each particles as particle (particle.id)}
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
