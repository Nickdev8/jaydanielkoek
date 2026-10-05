<script lang="ts">
	import type { SitePhoto } from '$lib/site/content';
	import { onMount } from 'svelte';

	let {
		photos,
		selectedIndex = $bindable<number | null>(null),
		opener = $bindable<HTMLElement | null>(null)
	}: { photos: SitePhoto[]; selectedIndex?: number | null; opener?: HTMLElement | null } = $props();
	let dialog: HTMLDialogElement;
	let previousOverflow = '';

	onMount(() => () => {
		if (dialog?.open || selectedIndex !== null) document.body.style.overflow = previousOverflow;
	});

	$effect(() => {
		if (selectedIndex !== null && !dialog.open) {
			previousOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			dialog.showModal();
		} else if (selectedIndex === null && dialog.open) {
			dialog.close();
		}
	});

	function close() {
		dialog.close();
	}
	function move(amount: number) {
		if (selectedIndex === null) return;
		selectedIndex = (selectedIndex + amount + photos.length) % photos.length;
	}
	function onClose() {
		document.body.style.overflow = previousOverflow;
		selectedIndex = null;
		const target = opener;
		opener = null;
		target?.focus();
	}
	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			move(-1);
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			move(1);
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="viewer"
	aria-label="Fotoviewer"
	onclose={onClose}
	oncancel={() => (selectedIndex = null)}
	onkeydown={onKeydown}
>
	{#if selectedIndex !== null}
		<div class="toolbar">
			<span>{selectedIndex + 1} / {photos.length}</span>
			<button type="button" aria-label="Sluiten" onclick={close}
				>Sluiten <span aria-hidden="true">×</span></button
			>
		</div>
		<button class="arrow previous" type="button" aria-label="Vorige foto" onclick={() => move(-1)}
			>←</button
		>
		<figure>
			<img src={photos[selectedIndex].src} alt={photos[selectedIndex].alt} />
			<figcaption>{photos[selectedIndex].caption}</figcaption>
		</figure>
		<button class="arrow next" type="button" aria-label="Volgende foto" onclick={() => move(1)}
			>→</button
		>
	{/if}
</dialog>

<style>
	.viewer {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100dvh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 1.25rem;
		border: 0;
		background: #080908;
		color: #f3f0e9;
	}
	.viewer::backdrop {
		background: #080908;
	}
	.toolbar {
		position: absolute;
		z-index: 1;
		top: 1rem;
		left: 1.25rem;
		right: 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: rgba(243, 240, 233, 0.7);
		font: 0.85rem var(--font-body);
	}
	.toolbar button,
	.arrow {
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.toolbar button {
		padding: 0.5rem;
		font-size: 1rem;
	}
	.toolbar button span {
		margin-left: 0.35rem;
		font-size: 1.4rem;
	}
	.viewer figure {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		margin: 0;
	}
	.viewer figure img {
		display: block;
		max-width: calc(100vw - 8rem);
		max-height: calc(100dvh - 6rem);
		object-fit: contain;
	}
	.viewer figcaption {
		margin-top: 0.65rem;
		color: rgba(243, 240, 233, 0.7);
		font: 0.85rem var(--font-body);
	}
	.arrow {
		position: absolute;
		z-index: 2;
		top: 50%;
		transform: translateY(-50%);
		padding: 1rem;
		font-size: 2rem;
	}
	.previous {
		left: 0.5rem;
	}
	.next {
		right: 0.5rem;
	}
	.viewer button:focus-visible {
		outline: 2px solid white;
		outline-offset: 3px;
	}
	@media (max-width: 600px) {
		.viewer {
			padding: 0.75rem;
		}
		.viewer figure img {
			max-width: calc(100vw - 3rem);
			max-height: calc(100dvh - 7rem);
		}
		.arrow {
			top: auto;
			bottom: 1rem;
			transform: none;
		}
		.previous {
			left: 1rem;
		}
		.next {
			right: 1rem;
		}
	}
</style>
