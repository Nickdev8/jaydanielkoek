<script lang="ts">
	import { Canvas } from '@threlte/core';
	import CameraModelScene from './CameraModelScene.svelte';

	let { onready, onerror }: { onready: () => void; onerror: () => void } = $props();
</script>

<Canvas renderMode="on-demand" dpr={[1, 1.2]} shadows={true}>
	<CameraModelScene {onready} {onerror} />
</Canvas>
