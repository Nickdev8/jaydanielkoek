<script lang="ts">
	import { onMount, type Component } from 'svelte';

	let element: HTMLDivElement;
	let CameraCanvas = $state<Component<{ onready: () => void; onerror: () => void }>>();
	let ready = $state(false);
	let failed = $state(false);

	onMount(() => {
		let disposed = false;
		const observer = new IntersectionObserver(
			async (entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				try {
					const module = await import('./CameraCanvas.svelte');
					if (!disposed) CameraCanvas = module.default;
				} catch {
					if (!disposed) failed = true;
				}
			},
			{ rootMargin: '240px' }
		);
		observer.observe(element);
		return () => {
			disposed = true;
			observer.disconnect();
		};
	});
</script>

<div
	class="camera-art"
	class:ready
	bind:this={element}
	role="img"
	aria-label="Een camera met de lens naar je toe"
>
	{#if failed}
		<p>De camera kan niet worden weergegeven.</p>
	{:else if CameraCanvas}
		<svelte:boundary onerror={() => (failed = true)}>
			<CameraCanvas onready={() => (ready = true)} onerror={() => (failed = true)} />
		</svelte:boundary>
	{/if}
</div>

<style>
	.camera-art {
		width: 100%;
		height: clamp(280px, 34vw, 480px);
		min-width: 0;
	}
	.camera-art :global(canvas) {
		opacity: 0;
		transition: opacity 180ms ease;
		pointer-events: none;
	}
	.camera-art.ready :global(canvas) {
		opacity: 1;
	}
	p {
		font-size: 14px;
		color: var(--muted);
	}
	@media (max-width: 760px) {
		.camera-art {
			height: 280px;
		}
	}
</style>
