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
	let joystickElement = $state.raw<HTMLDivElement>();
	let joystickTurn = $state(0);
	let joystickMove = $state(0);
	let joystickThumbX = $state(0);
	let joystickThumbY = $state(0);
	let joystickPointerId = $state<number>();

	const movementKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD']);
	const joystickRadius = 38;

	const openLensSelector = () => goto(`/lenses/${data.category.id}`);
	const onready = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isLoading = false;
			});
		});
	};

	const updateJoystick = (event: PointerEvent) => {
		if (!joystickElement) return;

		const bounds = joystickElement.getBoundingClientRect();
		const offsetX = event.clientX - (bounds.left + bounds.width / 2);
		const offsetY = event.clientY - (bounds.top + bounds.height / 2);
		const distance = Math.hypot(offsetX, offsetY);
		const scale = distance > joystickRadius ? joystickRadius / distance : 1;

		joystickThumbX = offsetX * scale;
		joystickThumbY = offsetY * scale;
		joystickTurn = joystickThumbX / joystickRadius;
		joystickMove = -joystickThumbY / joystickRadius;
	};

	const startJoystick = (event: PointerEvent) => {
		if (event.pointerType === 'mouse') return;

		event.preventDefault();
		joystickPointerId = event.pointerId;
		joystickElement?.setPointerCapture(event.pointerId);
		updateJoystick(event);
		showControlsHint = false;
	};

	const moveJoystick = (event: PointerEvent) => {
		if (event.pointerId !== joystickPointerId) return;

		updateJoystick(event);
	};

	const stopJoystick = (event: PointerEvent) => {
		if (event.pointerId !== joystickPointerId) return;

		joystickPointerId = undefined;
		joystickTurn = 0;
		joystickMove = 0;
		joystickThumbX = 0;
		joystickThumbY = 0;
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

<main class="showcase-page">
	<section class="screen-reader-context">
		<h1>{data.category.label} photography by Jayden Daniel Koek</h1>
		<p>
			An interactive 3D gallery of Jayden Daniel Koek’s {data.category.label.toLowerCase()} photography.
		</p>
		<a href="/contact">Contact Jayden Daniel Koek</a>
	</section>

	<Canvas>
		<Scene category={data.category} {onready} {joystickTurn} {joystickMove} />
	</Canvas>

	<button class="change-category" onclick={openLensSelector}>
		<span>Change category</span>
		<kbd>Space</kbd>
	</button>

	<div
		class:active={joystickPointerId !== undefined}
		class="joystick"
		bind:this={joystickElement}
		role="application"
		aria-label="Move through the showcase"
		onpointerdown={startJoystick}
		onpointermove={moveJoystick}
		onpointerup={stopJoystick}
		onpointercancel={stopJoystick}
	>
		<div
			class="joystick-thumb"
			style:transform={`translate(${joystickThumbX}px, ${joystickThumbY}px)`}
		></div>
	</div>

	{#if showControlsHint}
		<p class="controls-hint">
			<span class="desktop-controls">Use the arrow keys or drag to move</span>
			<span class="mobile-controls">Use the joystick or drag to move</span>
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
	.change-category {
		position: absolute;
		z-index: 1;
		bottom: clamp(1.5rem, 4vw, 3rem);
		left: clamp(1.25rem, 3vw, 3rem);
		display: inline-flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.75rem 0.9rem;
		border: 1px solid rgba(245, 247, 242, 0.8);
		border-radius: 8px;
		background: rgba(8, 12, 21, 0.5);
		color: #f5f7f2;
		font: 0.95rem/1 system-ui, sans-serif;
		cursor: pointer;
		margin: 0;
		transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
	}
	.change-category kbd {
		padding: 0.2rem 0.32rem;
		border: 1px solid rgba(245, 247, 242, 0.36);
		border-radius: 3px;
		color: rgba(245, 247, 242, 0.72);
		font: 0.68rem/1 system-ui, sans-serif;
	}
	.change-category:hover,
	.change-category:focus-visible {
		border-color: #fff;
		background: #f5f7f2;
		color: #080c15;
	}
	.change-category:hover kbd,
	.change-category:focus-visible kbd {
		border-color: rgba(8, 12, 21, 0.4);
		color: inherit;
	}
	.change-category:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 4px;
	}
	.joystick {
		display: none;
	}
	@media (max-width: 767px) {
		.controls-hint {
			top: max(4.5rem, env(safe-area-inset-top));
			bottom: auto;
		}
		.change-category {
			left: max(1.25rem, env(safe-area-inset-left));
			bottom: max(1.75rem, env(safe-area-inset-bottom));
		}
		.change-category kbd {
			display: none;
		}
		.desktop-controls {
			display: none;
		}
		.mobile-controls {
			display: inline;
		}
		.joystick {
			position: absolute;
			z-index: 2;
			right: max(1.25rem, env(safe-area-inset-right));
			bottom: max(1.25rem, env(safe-area-inset-bottom));
			display: grid;
			width: 6.5rem;
			height: 6.5rem;
			place-items: center;
			border: 1px solid rgba(245, 247, 242, 0.42);
			border-radius: 50%;
			background: rgba(8, 12, 21, 0.28);
			touch-action: none;
			user-select: none;
		}
		.joystick::before,
		.joystick::after {
			position: absolute;
			background: rgba(245, 247, 242, 0.2);
			content: '';
		}
		.joystick::before {
			width: 1px;
			height: 1.5rem;
		}
		.joystick::after {
			width: 1.5rem;
			height: 1px;
		}
		.joystick-thumb {
			width: 2.7rem;
			height: 2.7rem;
			border: 1px solid rgba(245, 247, 242, 0.82);
			border-radius: 50%;
			background: rgba(245, 247, 242, 0.12);
			transition: transform 90ms ease-out;
		}
		.joystick.active .joystick-thumb {
			background: rgba(245, 247, 242, 0.24);
			transition: none;
		}
	}
</style>
