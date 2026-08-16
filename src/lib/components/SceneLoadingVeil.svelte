<script lang="ts">
	let {
		loaded = false,
		leaving = false,
		background = '#000',
		foreground = '#fff',
		spinner = true,
		duration = 650
	}: {
		loaded?: boolean;
		leaving?: boolean;
		background?: string;
		foreground?: string;
		spinner?: boolean;
		duration?: number;
	} = $props();
</script>

<div
	class:loaded
	class:leaving
	class="scene-loading-veil"
	style:--veil-background={background}
	style:--veil-foreground={foreground}
	style:--veil-duration={`${duration}ms`}
	aria-hidden="true"
>
	{#if spinner}
		<span class="loading-wheel"></span>
	{/if}
</div>

<style>
	.scene-loading-veil {
		position: absolute;
		z-index: 20;
		inset: 0;
		background: var(--veil-background);
		pointer-events: all;
		opacity: 1;
		transition: opacity var(--veil-duration) ease;
	}
	.scene-loading-veil.loaded {
		pointer-events: none;
		opacity: 0;
	}
	.scene-loading-veil.leaving {
		pointer-events: all;
		opacity: 1;
	}
	.loading-wheel {
		position: absolute;
		right: clamp(1.5rem, 3vw, 3rem);
		bottom: clamp(1.5rem, 3vw, 3rem);
		width: 1.1rem;
		aspect-ratio: 1;
		border: 1px solid color-mix(in srgb, var(--veil-foreground) 28%, transparent);
		border-top-color: var(--veil-foreground);
		border-radius: 50%;
		animation: scene-loading-spin 800ms linear infinite;
	}
	@keyframes scene-loading-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scene-loading-veil {
			transition-duration: 0ms;
		}
		.loading-wheel {
			animation: none;
		}
	}
</style>
