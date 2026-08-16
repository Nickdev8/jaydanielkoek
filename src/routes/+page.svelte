<script lang="ts">
	import { goto } from '$app/navigation';
	import { Canvas } from '@threlte/core';
	import SceneLoadingVeil from '$lib/components/SceneLoadingVeil.svelte';
	import Scene from './Scene.svelte';

	let started = $state(false);
	let isLoading = $state(true);
	let showTransitionName = $state(false);
	let isLeaving = $state(false);

	function start() {
		started = true;
	}

	const wait = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration));

	async function onarrive() {
		if (isLeaving) return;

		showTransitionName = true;
		await wait(900);
		isLeaving = true;
		await wait(600);
		sessionStorage.setItem('showcase-controls-hint', 'true');
		goto('/showcase/nature');
	}

	function onready() {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isLoading = false;
			});
		});
	}
</script>

<main>
	<Canvas>
		<Scene {started} {onarrive} {onready} />
	</Canvas>

	<section class:leaving={started} class="intro" aria-label="Jayden Daniel Koek">
		<h1><span>Jayden</span><span>Daniel Koek</span></h1>
		<button class="start-button" onclick={start} disabled={started}>Enter showcase</button>
	</section>

	<p class:leaving={started} class="credit">
		<a href="https://nickesselman.nl">Made by Nick Esselman</a>
		<br>
		<a href="model-credits">Model Credits</a>
		<br>
		<span class:leaving={started} class="copyright">© 2026 Jayden Daniel Koek</span>
	</p>

	{#if showTransitionName}
		<p class="transition-name">Jayden Daniel Koek</p>
	{/if}

	<SceneLoadingVeil loaded={!isLoading} leaving={isLeaving} duration={700} />
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html),
	:global(body) {
		margin: 0;
		min-height: 100%;
		background: #111;
	}
	main {
		position: relative;
		width: 100vw;
		height: 100svh;
		overflow-x: hidden;
		overflow-y: hidden;
		background: #033542;
	}
	main::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 5;
		pointer-events: none;
		background: radial-gradient(
			ellipse at center,
			transparent 26%,
			rgba(0, 0, 0, 0.2) 48%,
			rgba(0, 0, 0, 0.6) 74%,
			rgba(0, 0, 0, 0.9) 100%
		);
	}
	.intro {
		position: absolute;
		z-index: 10;
		top: clamp(1.75rem, 6vw, 5rem);
		left: clamp(1.5rem, 5vw, 5rem);
		color: #f5f7f2;
		transition: opacity 180ms ease;
	}
	.intro.leaving,
	.credit.leaving,
	.copyright.leaving {
		pointer-events: none;
		opacity: 0;
	}
	:global(main:has(.intro.leaving) ~ .utility-nav) {
		pointer-events: none;
		opacity: 0;
	}
	h1 {
		margin: 0;
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
		font-size: clamp(3rem, 6.8vw, 7rem);
		font-weight: 400;
		letter-spacing: -0.07em;
		line-height: 0.78;
	}
	h1 span {
		display: block;
	}
	.start-button {
		margin-top: clamp(2rem, 5vw, 4.5rem);
		padding: 0.72rem 1.25rem 0.78rem;
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: 999px;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: clamp(1rem, 1.2vw, 1.15rem);
		line-height: 1;
		cursor: pointer;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			border-color 160ms ease;
	}
	.start-button:hover:not(:disabled),
	.start-button:focus-visible:not(:disabled) {
		border-color: #fff;
		background: #f5f7f2;
		color: #062d36;
	}
	.start-button:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 4px;
	}
	.start-button:disabled {
		cursor: wait;
		opacity: 0.55;
	}
	.credit {
		position: absolute;
		z-index: 10;
		left: clamp(1.5rem, 3vw, 3rem);
		bottom: clamp(1.5rem, 3vw, 3rem);
		margin: 0;
		color: rgba(245, 247, 242, 0.7);
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
		font-size: clamp(0.8rem, 1vw, 0.95rem);
		transition: opacity 180ms ease;
	}
	.credit a {
		color: rgba(245, 247, 242, 0.9);
		text-decoration: underline;
		text-decoration-color: rgba(245, 247, 242, 0.45);
		text-underline-offset: 0.18em;
		text-decoration-thickness: 1px;
		transition: color 160ms ease, text-decoration-color 160ms ease;
	}
	.credit a:hover,
	.credit a:focus-visible {
		color: #fff;
		text-decoration-color: currentColor;
	}
	.copyright {
		display: inline-block;
		margin-top: 0.35rem;
		color: rgba(245, 247, 242, 0.5);
		font-size: 0.85em;
	}
	.transition-name {
		position: absolute;
		z-index: 15;
		top: 50%;
		left: 50%;
		margin: 0;
		color: #fff;
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
		font-size: clamp(2.5rem, 5vw, 5.5rem);
		letter-spacing: -0.06em;
		line-height: 1;
		transform: translate(-50%, -50%);
		animation: transition-name-in 220ms ease both;
	}
	@keyframes transition-name-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.intro,
		.credit,
		.copyright,
		.transition-name {
			transition-duration: 0ms;
			animation-duration: 0ms;
		}
	}
</style>
