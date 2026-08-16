<script lang="ts">
	import { goto } from '$app/navigation';
	import { Canvas } from '@threlte/core';
	import { onMount, untrack } from 'svelte';
	import type { ShowcaseCategory } from '$lib/showcase/types';
	import LensSelectorScene from './LensSelectorScene.svelte';
	import SceneLoadingVeil from '$lib/components/SceneLoadingVeil.svelte';

	let { data }: { data: { category: ShowcaseCategory; categories: ShowcaseCategory[] } } = $props();
	let selectedLens = $state(untrack(() => data.category.lens));
	let attachRequested = $state(false);
	let isLoading = $state(true);
	let loadedModelKeys = new Set<string>();

	$effect(() => {
		selectedLens = data.category.lens;
		attachRequested = false;
		isLoading = true;
		loadedModelKeys = new Set();
	});

	const onModelReady = (modelKey: string) => {
		if (loadedModelKeys.has(modelKey)) return;

		loadedModelKeys.add(modelKey);
		if (loadedModelKeys.size !== data.categories.length + 1) return;

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isLoading = false;
			});
		});
	};

	const selectLens = (lens: number) => {
		if (isLoading || attachRequested) return;
		selectedLens = lens;
	};

	const selectLensAndAttach = (lens: number) => {
		selectLens(lens);
		attachRequested = true;
	};

	const attachSelectedLens = () => {
		if (isLoading || attachRequested) return;
		attachRequested = true;
	};

	const selectByOffset = (offset: number) => {
		const currentIndex = data.categories.findIndex((category) => category.lens === selectedLens);
		const nextIndex = Math.max(
			0,
			Math.min(data.categories.length - 1, currentIndex + offset)
		);
		selectLens(data.categories[nextIndex].lens);
	};

	const onAttached = (categoryId: string) => goto(`/showcase/${categoryId}`);

	onMount(() => {
		const gestureThreshold = 48;
		let isDragging = false;
		let dragStartX = 0;
		let dragStartY = 0;

		const onKeyDown = (event: KeyboardEvent) => {
			if (isLoading || attachRequested) return;
			if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
				event.preventDefault();
				selectByOffset(-1);
				return;
			}
			if (event.code === 'KeyD' || event.code === 'ArrowRight') {
				event.preventDefault();
				selectByOffset(1);
				return;
			}
			if (event.code === 'KeyS' || event.code === 'ArrowDown' || event.code === 'Space') {
				if (event.repeat) return;

				event.preventDefault();
				attachSelectedLens();
				return;
			}

			const categoryNumber = Number(event.key);
			if (categoryNumber >= 1 && categoryNumber <= data.categories.length) {
				const category = data.categories[categoryNumber - 1];
				if (!category) return;

				event.preventDefault();
				selectLensAndAttach(category.lens);
			}
		};

		const onPointerDown = (event: PointerEvent) => {
			if (
				isLoading ||
				attachRequested ||
				event.button !== 0 ||
				!(event.target instanceof HTMLCanvasElement)
			)
				return;

			isDragging = true;
			dragStartX = event.clientX;
			dragStartY = event.clientY;
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!isDragging) return;

			const dragX = event.clientX - dragStartX;
			const dragY = event.clientY - dragStartY;
			if (Math.abs(dragY) >= gestureThreshold && Math.abs(dragY) > Math.abs(dragX)) {
				if (dragY > 0) attachSelectedLens();
				isDragging = false;
				return;
			}
			if (Math.abs(dragX) >= gestureThreshold && Math.abs(dragX) > Math.abs(dragY)) {
				selectByOffset(dragX < 0 ? 1 : -1);
				dragStartX = event.clientX;
				dragStartY = event.clientY;
			}
		};

		const stopDragging = () => (isDragging = false);

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', stopDragging);
		window.addEventListener('pointercancel', stopDragging);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', stopDragging);
			window.removeEventListener('pointercancel', stopDragging);
		};
	});
</script>

<svelte:head>
	<meta name="description" content="Select a photography category through its camera lens." />
</svelte:head>

<main class="lens-selector-page">
	<Canvas>
		{#key data.category.id}
			<LensSelectorScene
				currentCategory={data.category}
				categories={data.categories}
				bind:selectedLens
				{attachRequested}
				ready={!isLoading}
				onmodelready={onModelReady}
				onlensselected={selectLens}
				onattached={onAttached}
			/>
		{/key}
	</Canvas>

	<div class="selector-tooltip">
		<span class="keyboard-control">Use arrow keys or drag to browse lenses</span>
		<span class="drag-control">
			<svg viewBox="0 0 48 20" aria-hidden="true"><path d="m8 10 7-6m-7 6 7 6m-7-6h32m-7-6 7 6-7 6" /></svg>
			Drag sideways to browse
		</span>
		<span class="drag-control select-control">
			<svg viewBox="0 0 20 48" aria-hidden="true"><path d="m10 8-6 7m6-7 6 7m-6-7v32m-6-7 6 7 6-7" /></svg>
			Drag down to select
		</span>
	</div>

	<SceneLoadingVeil loaded={!isLoading} background="#fff" foreground="#161a1a" duration={450} />
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html:has(.lens-selector-page)),
	:global(body:has(.lens-selector-page)) {
		margin: 0;
		min-height: 100%;
		background: #fff;
	}
	main {
		position: relative;
		width: 100vw;
		height: 100svh;
		overflow: hidden;
		background: #fff;
		color: #161a1a;
	}
	main :global(canvas) {
		touch-action: none;
	}
	.selector-tooltip {
		position: absolute;
		z-index: 1;
		bottom: clamp(1.5rem, 4vw, 3rem);
		left: 50%;
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(0.75rem, 2vw, 1.5rem);
		color: rgba(22, 26, 26, 0.72);
		font: 300 clamp(0.75rem, 1vw, 0.9rem) system-ui, sans-serif;
		letter-spacing: 0.03em;
		transform: translateX(-50%);
	}
	.drag-control {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.drag-control svg {
		width: 1.45rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.35;
	}
	.drag-control:last-child svg {
		width: 0.9rem;
		height: 1.35rem;
	}
	@media (max-width: 640px) {
		.selector-tooltip {
			flex-direction: column;
			gap: 0.45rem;
			text-align: center;
		}
		.keyboard-control {
			display: none;
		}
	}
</style>
