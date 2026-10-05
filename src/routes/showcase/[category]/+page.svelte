<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { onMount } from 'svelte';
	import type { ShowcaseCategory } from '$lib/showcase/types';
	import { getSiteUi } from '$lib/site/ui';
	import Scene from '../Scene.svelte';
	import Minimap from '../Minimap.svelte';
	import SceneLoadingVeil from '$lib/components/SceneLoadingVeil.svelte';

	let { data }: { data: { category: ShowcaseCategory } } = $props();
	const ui = getSiteUi();
	const controlsEnabled = $derived(!ui.menuOpen);
	let showControlsHint = $state(false);
	let isLoading = $state(true);
	let viewMode = $state<'walk' | 'grid'>('walk');
	let cameraPosition = $state<[number, number, number]>([0, 0, 0]);
	let cameraRotation = $state(0);
	let pointerStart: { x: number; y: number; hintDismissDistance: number } | undefined;

	const movementKeys = new Set([
		'ArrowUp',
		'ArrowDown',
		'ArrowLeft',
		'ArrowRight',
		'KeyW',
		'KeyA',
		'KeyS',
		'KeyD'
	]);
	const posterGroups = $derived.by(() => {
		const groups = new Map<number, typeof data.category.posters>();
		for (const poster of data.category.posters) {
			const posters = groups.get(poster.step) ?? [];
			posters.push(poster);
			groups.set(poster.step, posters);
		}
		return Array.from(groups, ([step, posters]) => ({
			step,
			posters: posters.toSorted((a, b) => a.angle - b.angle)
		})).toSorted((a, b) => a.step - b.step);
	});
	const photoName = (image: string) =>
		image
			.split('/')
			.at(-1)
			?.replace(/\.[^.]+$/, '')
			.replaceAll(/[-_]+/g, ' ') ?? 'Foto';

	const onready = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isLoading = false;
			});
		});
	};

	$effect(() => {
		if (!controlsEnabled) pointerStart = undefined;
	});

	onMount(() => {
		showControlsHint = sessionStorage.getItem('showcase-controls-seen') !== 'true';
		sessionStorage.setItem('showcase-controls-seen', 'true');

		const onKeyDown = (event: KeyboardEvent) => {
			if (!controlsEnabled) return;
			if (movementKeys.has(event.code)) showControlsHint = false;
		};

		const onPointerDown = (event: PointerEvent) => {
			if (!controlsEnabled) return;
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

<main class="showcase-page" class:photo-grid-view={viewMode === 'grid'}>
	{#if viewMode === 'walk'}
		<section class="screen-reader-context">
			<h1>Fotografie van Jayden Daniel Koek</h1>
			<p>Een interactieve galerie met natuur- en stadsfotografie van Jayden Daniel Koek.</p>
		</section>

		<button class="view-switch" type="button" onclick={() => (viewMode = 'grid')}>
			Galerie in foto's
		</button>

		<Canvas>
			<Scene
				category={data.category}
				{onready}
				{controlsEnabled}
				bind:cameraPosition
				bind:cameraRotation
			/>
		</Canvas>

		{#if !isLoading}
			<Minimap posters={data.category.posters} {cameraPosition} {cameraRotation} />
		{/if}

		{#if showControlsHint}
			<p class="controls-hint">
				<span class="desktop-controls">Gebruik de pijltjestoetsen of sleep om te bewegen</span>
				<span class="mobile-controls">Sleep om te bewegen</span>
			</p>
		{/if}

		<SceneLoadingVeil loaded={!isLoading} />
	{:else}
		<section class="photo-gallery page-shell" aria-labelledby="photo-gallery-title">
			<header class="gallery-toolbar">
				<h1 id="photo-gallery-title">Fotografie</h1>
				<button class="view-switch" type="button" onclick={() => (viewMode = 'walk')}>
					Terug naar de 3D-galerie
				</button>
			</header>
			{#each posterGroups as group (group.step)}
				<section class="step-group" aria-labelledby={`step-${group.step}`}>
					<h2 id={`step-${group.step}`}>Stap {group.step}</h2>
					<div class="poster-grid">
						{#each group.posters as poster (poster.image)}
							<figure>
								<img src={poster.image} alt={`Foto: ${photoName(poster.image)}`} loading="lazy" />
							</figure>
						{/each}
					</div>
				</section>
			{/each}
		</section>
	{/if}
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
	main.photo-grid-view {
		width: 100%;
		height: auto;
		min-height: 100svh;
		overflow: visible;
		padding-block: calc(104px + 24px) clamp(40px, 8vw, 96px);
		color: var(--paper);
	}
	main :global(canvas) {
		touch-action: none;
		user-select: none;
	}
	.screen-reader-context {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
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
	main.photo-grid-view::after {
		display: none;
	}
	.view-switch {
		position: absolute;
		top: max(24px, env(safe-area-inset-top));
		left: max(24px, env(safe-area-inset-left));
		z-index: 3;
		padding: 10px 0;
		border: 0;
		background: transparent;
		color: var(--paper);
		font: 400 0.85rem/1.4 var(--font-body);
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
	}
	.gallery-toolbar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 40px;
	}
	.gallery-toolbar h1 {
		margin: 0;
		font: 400 clamp(40px, 6vw, 68px)/1.05 var(--font-display);
	}
	.gallery-toolbar .view-switch {
		position: static;
		flex: 0 0 auto;
	}
	.step-group {
		margin-top: 36px;
	}
	.step-group h2 {
		margin: 0 0 18px;
		font: 400 clamp(24px, 3vw, 34px)/1.2 var(--font-display);
	}
	.poster-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
		align-items: start;
		gap: clamp(16px, 2.2vw, 30px);
	}
	.poster-grid figure {
		margin: 0;
	}
	.poster-grid img {
		display: block;
		width: 100%;
		height: auto;
	}
	.controls-hint {
		position: absolute;
		z-index: 1;
		bottom: clamp(3rem, 7vw, 4.5rem);
		left: 50%;
		margin: 0;
		color: rgba(245, 247, 242, 0.72);
		font: 400 clamp(0.75rem, 1vw, 0.9rem) var(--font-body);
		letter-spacing: 0.03em;
		transform: translateX(-50%);
		width: max-content;
		max-width: calc(100% - 48px);
		text-align: center;
		transition: opacity 180ms ease;
	}
	.mobile-controls {
		display: none;
	}
	@media (max-width: 767px) {
		main.photo-grid-view {
			padding-top: calc(88px + 24px + env(safe-area-inset-top));
		}
		.gallery-toolbar {
			align-items: flex-start;
			margin-bottom: 28px;
		}
		.gallery-toolbar .view-switch {
			max-width: 12ch;
			text-align: right;
		}
		.step-group {
			margin-top: 28px;
		}
		.controls-hint {
			top: max(4.5rem, env(safe-area-inset-top));
			bottom: auto;
		}
		.desktop-controls {
			display: none;
		}
		.mobile-controls {
			display: inline;
		}
	}
</style>
