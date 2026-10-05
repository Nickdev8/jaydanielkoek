<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getSiteUi } from '$lib/site/ui';

	const ui = getSiteUi();
	let dialog: HTMLDialogElement;
	let scrolled = $state(false);
	let previousOverflow = '';
	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/showcase/all', label: 'Fotografie' },
		{ href: '/over', label: 'Over' },
		{ href: '/contact', label: 'Contact' }
	];
	const isGallery = $derived(page.url.pathname.startsWith('/showcase'));
	const isHome = $derived(page.url.pathname === '/');

	function openMenu() {
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		ui.menuOpen = true;
		dialog.showModal();
	}

	function closeMenu() {
		if (!dialog?.open) return;
		dialog.close();
		ui.menuOpen = false;
		document.body.style.overflow = previousOverflow;
	}

	function onClose() {
		ui.menuOpen = false;
		document.body.style.overflow = previousOverflow;
	}

	function onCancel(event: Event) {
		event.preventDefault();
		closeMenu();
	}

	afterNavigate(closeMenu);

	onMount(() => {
		const updateScroll = () => (scrolled = window.scrollY > 104);
		updateScroll();
		window.addEventListener('scroll', updateScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', updateScroll);
			if (ui.menuOpen) document.body.style.overflow = previousOverflow;
		};
	});
</script>

<header
	class:hero={isHome}
	class:solid={!isHome && !isGallery}
	class:gallery={isGallery}
	class:menu-open={ui.menuOpen}
	inert={isHome && scrolled}
	aria-hidden={isHome && scrolled}
>
	<a class="wordmark" href="/" aria-label="Jayden Daniel Koek, home">
		<span>Jayden</span><span>Daniel Koek</span>
	</a>
	<button class="menu-toggle" onclick={openMenu} aria-haspopup="dialog" aria-expanded={ui.menuOpen}>
		Menu <span class="menu-lines" aria-hidden="true"></span>
	</button>
</header>

{#if isHome && scrolled}
	<header class="compact-header" class:menu-open={ui.menuOpen}>
		<a class="compact-wordmark" href="/" aria-label="Jayden Daniel Koek, home">Jayden Daniel Koek</a
		>
		<button
			class="compact-menu"
			onclick={openMenu}
			aria-haspopup="dialog"
			aria-expanded={ui.menuOpen}
		>
			Menu <span class="menu-lines" aria-hidden="true"></span>
		</button>
	</header>
{/if}

<dialog
	class="menu-dialog"
	bind:this={dialog}
	onclose={onClose}
	oncancel={onCancel}
	aria-label="Hoofdnavigatie"
>
	<div class="menu-top">
		<a class="wordmark" href="/" onclick={closeMenu} aria-label="Jayden Daniel Koek, home">
			<span>Jayden</span><span>Daniel Koek</span>
		</a>
		<button class="close-menu" onclick={closeMenu} aria-label="Menu sluiten">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M21 3 3 21" /></svg>
		</button>
	</div>
	<nav aria-label="Hoofdnavigatie" class="menu-links">
		{#each links as link}
			<a
				href={link.href}
				onclick={closeMenu}
				aria-current={page.url.pathname === link.href ? 'page' : undefined}>{link.label}</a
			>
		{/each}
	</nav>
</dialog>

<style>
	header,
	.menu-top {
		height: 104px;
		position: relative;
		color: var(--paper);
	}
	header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 16777272;
		transition: background-color 180ms ease;
	}
	header.solid {
		background: #202522;
	}
	header.hero {
		position: absolute;
	}
	.compact-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: calc(56px + env(safe-area-inset-top));
		padding: env(safe-area-inset-top) max(24px, 4vw, env(safe-area-inset-right)) 0
			max(24px, 4vw, env(safe-area-inset-left));
		background: #202522;
		animation: appear 180ms ease;
	}
	.compact-wordmark {
		font-family: var(--font-display);
		font-size: 22px;
		line-height: 1.1;
		text-decoration: none;
	}
	.compact-menu {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		padding: 8px;
		border: 0;
		background: none;
		color: inherit;
		font-size: 13px;
		cursor: pointer;
	}
	.compact-menu .menu-lines {
		width: 20px;
		height: 6px;
	}
	header.menu-open {
		visibility: hidden;
	}
	header.gallery {
		background: transparent;
		pointer-events: none;
	}
	header.gallery a,
	header.gallery button {
		pointer-events: auto;
	}
	.wordmark {
		position: absolute;
		left: 50%;
		top: 26px;
		transform: translateX(-50%);
		text-align: center;
		font-family: var(--font-display);
		font-size: 23px;
		line-height: 1.05;
		text-decoration: none;
	}
	.wordmark span {
		display: block;
	}
	.menu-toggle,
	.close-menu {
		position: absolute;
		top: 24px;
		right: max(24px, 4vw, env(safe-area-inset-right));
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		min-height: 48px;
		padding: 8px;
		border: 0;
		color: inherit;
		background: none;
		cursor: pointer;
		font-size: 15px;
	}
	.menu-lines {
		width: 24px;
		height: 8px;
		border-block: 1px solid currentColor;
	}
	.menu-dialog {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100dvh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		color: var(--paper);
		background: rgba(21, 31, 36, 0.99);
		overflow-y: auto;
	}
	.menu-dialog[open] {
		animation: appear 180ms ease;
	}
	.menu-dialog::backdrop {
		background: rgba(0, 0, 0, 0.15);
	}
	.close-menu {
		width: 48px;
	}
	.close-menu svg {
		width: 26px;
		height: 26px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1;
	}
	.menu-links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: clamp(24px, 4vh, 48px);
		width: min(1280px, 68%);
		margin: clamp(32px, 5vh, 72px) auto 80px;
	}
	.menu-links a {
		font-family: var(--font-display);
		font-size: clamp(48px, 5.7vw, 88px);
		line-height: 1.18;
		text-decoration: none;
		transition: opacity 180ms ease;
	}
	.menu-links a:hover {
		opacity: 0.6;
	}
	@keyframes appear {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (max-width: 600px) {
		header,
		.menu-top {
			height: 88px;
		}
		.wordmark {
			top: 23px;
			font-size: 20px;
		}
		.menu-toggle,
		.close-menu {
			top: 16px;
			right: max(16px, env(safe-area-inset-right));
			gap: 10px;
		}
		.menu-links {
			width: calc(100% - 48px);
			margin-top: 64px;
			gap: 32px;
		}
		.menu-links a {
			font-size: clamp(44px, 12vw, 64px);
		}
		.compact-header {
			height: calc(52px + env(safe-area-inset-top));
			padding-inline: max(16px, env(safe-area-inset-left)) max(16px, env(safe-area-inset-right));
		}
		.compact-wordmark {
			font-size: 18px;
		}
	}
</style>
