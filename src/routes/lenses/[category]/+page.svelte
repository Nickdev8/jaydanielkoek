<script lang="ts">
	import { goto } from '$app/navigation';
	import { Canvas } from '@threlte/core';
	import { onMount } from 'svelte';
	import type { ShowcaseCategory } from '$lib/showcase/types';
	import LensSelectorScene from './LensSelectorScene.svelte';

	let { data }: { data: { category: ShowcaseCategory; categories: ShowcaseCategory[] } } = $props();
	let selectedLens = $state(0);
	let attachRequested = $state(false);
	let attachAfterSelection = $state(false);
	let carouselRequested = $state(false);
	const lensKeyHint = $derived(
		data.categories.length === 1 ? '1' : `1–${data.categories.length}`
	);

	$effect(() => {
		selectedLens = data.category.lens;
		attachRequested = false;
		attachAfterSelection = false;
		carouselRequested = false;
	});

	const selectLens = (lens: number) => {
		if (attachRequested) return;
		selectedLens = lens;
		carouselRequested = true;
	};

	const selectLensAndAttach = (lens: number) => {
		selectLens(lens);
		attachAfterSelection = true;
	};

	const attachSelectedLens = () => {
		if (attachRequested) return;
		carouselRequested = true;
		attachAfterSelection = true;
	};

	const selectByOffset = (offset: number) => {
		const currentIndex = data.categories.findIndex((category) => category.lens === selectedLens);
		const nextIndex = Math.max(
			0,
			Math.min(data.categories.length - 1, currentIndex + offset)
		);
		selectLens(data.categories[nextIndex].lens);
	};

	const attachWhenCarouselSettles = () => {
		if (!attachAfterSelection || attachRequested) return;

		attachAfterSelection = false;
		attachRequested = true;
	};

	const onAttached = (categoryId: string) => goto(`/showcase/${categoryId}`);

	onMount(() => {
		const gestureThreshold = 48;
		let isDragging = false;
		let dragStartX = 0;
		let dragStartY = 0;

		const onKeyDown = (event: KeyboardEvent) => {
			if (attachRequested) return;
			if (event.code === 'ArrowLeft') {
				event.preventDefault();
				selectByOffset(-1);
				return;
			}
			if (event.code === 'ArrowRight') {
				event.preventDefault();
				selectByOffset(1);
				return;
			}

			const lensNumber = Number(event.key);
			if (lensNumber >= 1 && lensNumber <= 5) {
				const category = data.categories.find((category) => category.lens === lensNumber);
				if (!category) return;

				event.preventDefault();
				selectLensAndAttach(category.lens);
			}
		};

		const onPointerDown = (event: PointerEvent) => {
			if (attachRequested || event.button !== 0 || !(event.target instanceof HTMLCanvasElement)) return;

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

<main>
	<Canvas>
		{#key data.category.id}
			<LensSelectorScene
				currentCategory={data.category}
				categories={data.categories}
				bind:selectedLens
				{attachRequested}
				{attachAfterSelection}
				{carouselRequested}
				onlensselected={selectLens}
				onselectionsettled={attachWhenCarouselSettles}
				onattached={onAttached}
			/>
		{/key}
	</Canvas>

	<p class="selector-tooltip">
		Press {lensKeyHint} to select · drag left/right to browse · drag down to attach
	</p>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html),
	:global(body) {
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
		color: rgba(22, 26, 26, 0.72);
		font: 300 clamp(0.75rem, 1vw, 0.9rem) system-ui, sans-serif;
		letter-spacing: 0.03em;
		transform: translateX(-50%);
	}
</style>
