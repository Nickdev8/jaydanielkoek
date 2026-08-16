<script lang="ts">
	import { goto } from '$app/navigation';
	import { Canvas } from '@threlte/core';
	import { onMount } from 'svelte';
	import type { ShowcaseCategory } from '$lib/showcase/types';
	import Scene from '../Scene.svelte';
	import SceneLoadingVeil from '$lib/components/SceneLoadingVeil.svelte';

	let { data }: { data: { category: ShowcaseCategory } } = $props();
	let showControlsHint = $state(false);
	let isLoading = $state(true);
	let pointerStart: { x: number; y: number; hintDismissDistance: number } | undefined;

	const movementKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD']);

	const openLensSelector = () => goto(`/lenses/${data.category.id}`);
	const onready = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isLoading = false;
			});
		});
	};

	onMount(() => {
		showControlsHint = sessionStorage.getItem('showcase-controls-hint') === 'true';
		sessionStorage.removeItem('showcase-controls-hint');

		const onKeyDown = (event: KeyboardEvent) => {
			if (movementKeys.has(event.code)) showControlsHint = false;

			if (event.code !== 'Space' || event.repeat) return;
			if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;

			event.preventDefault();
			openLensSelector();
		};

		const onPointerDown = (event: PointerEvent) => {
			if (event.target instanceof HTMLCanvasElement) {
				pointerStart = {
					x: event.clientX,
					y: event.clientY,
					hintDismissDistance: event.pointerType === 'touch' ? 72 : 16
				};
			}
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!pointerStart) return;

			if (
				Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) >
				pointerStart.hintDismissDistance
			) {
				showControlsHint = false;
				pointerStart = undefined;
			}
		};

		const clearPointerStart = () => (pointerStart = undefined);

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', clearPointerStart);
		window.addEventListener('pointercancel', clearPointerStart);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', clearPointerStart);
			window.removeEventListener('pointercancel', clearPointerStart);
		};
	});
</script>

<svelte:head>
	<meta name="description" content={`${data.category.label} photography showcase.`} />
</svelte:head>

<main class="showcase-page">
	<Canvas>
		<Scene category={data.category} {onready} />
	</Canvas>

	<button class="change-category" onclick={openLensSelector}>Change category</button>
	<p class="category-hint">
		Press Space to <a href={`/lenses/${data.category.id}`}>Change category</a>.
	</p>

	{#if showControlsHint}
		<p class="controls-hint">
			<span class="desktop-controls">Use the arrow keys or drag to move</span>
			<span class="mobile-controls">Drag to move</span>
		</p>
	{/if}

	<SceneLoadingVeil loaded={!isLoading} />
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html:has(.showcase-page)),
	:global(body:has(.showcase-page)) {
		margin: 0;
		min-height: 100%;
		background: #080c15;
	}
	main {
		position: relative;
		width: 100vw;
		height: 100svh;
		overflow: hidden;
		background: #080c15;
	}
	main :global(canvas) {
		touch-action: none;
		user-select: none;
	}
	main::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse at center,
			transparent 26%,
			rgba(0, 0, 0, 0.2) 48%,
			rgba(0, 0, 0, 0.6) 74%,
			rgba(0, 0, 0, 0.9) 100%
		);
	}
	.change-category {
		position: absolute;
		z-index: 1;
		left: clamp(1.25rem, 3vw, 3rem);
		bottom: clamp(1.25rem, 3vw, 3rem);
		padding: 0.65rem 0.95rem;
		border: 1px solid rgba(255, 255, 255, 0.75);
		border-radius: 999px;
		background: transparent;
		color: #f5f7f2;
		font: 0.95rem system-ui, sans-serif;
		cursor: pointer;
		transition: background-color 160ms ease, color 160ms ease;
	}
	.controls-hint {
		position: absolute;
		z-index: 1;
		bottom: clamp(3rem, 7vw, 4.5rem);
		left: 50%;
		margin: 0;
		color: rgba(245, 247, 242, 0.72);
		font: 300 clamp(0.75rem, 1vw, 0.9rem) system-ui, sans-serif;
		letter-spacing: 0.03em;
		transform: translateX(-50%);
		transition: opacity 180ms ease;
	}
	.mobile-controls {
		display: none;
	}
	.category-hint {
		position: absolute;
		z-index: 1;
		bottom: clamp(1.5rem, 4vw, 3rem);
		left: 50%;
		margin: 0;
		color: rgba(245, 247, 242, 0.72);
		font: 300 clamp(0.75rem, 1vw, 0.9rem) system-ui, sans-serif;
		letter-spacing: 0.03em;
		transform: translateX(-50%);
	}
	.category-hint a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.category-hint a:focus-visible {
		outline: 1px solid currentColor;
		outline-offset: 3px;
	}
	.change-category:hover,
	.change-category:focus-visible {
		background: #f5f7f2;
		color: #080c15;
	}
	.change-category:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 4px;
	}
	@media (min-width: 768px) {
		.change-category {
			display: none;
		}
	}
	@media (max-width: 767px) {
		.controls-hint {
			top: max(4.5rem, env(safe-area-inset-top));
			bottom: auto;
		}
		.category-hint {
			display: none;
		}
		.desktop-controls {
			display: none;
		}
		.mobile-controls {
			display: inline;
		}
	}
</style>
