<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { Canvas } from '@threlte/core';
	import { onMount } from 'svelte';
	import SceneLoadingVeil from '$lib/components/SceneLoadingVeil.svelte';
	import Scene from './Scene.svelte';

	let isLoading = $state(true);
	let showDesktopScene = $state(false);
	const contactEmail = env.PUBLIC_CONTACT_EMAIL;
	const contactPhone = env.PUBLIC_CONTACT_PHONE;

	const onready = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isLoading = false;
			});
		});
	};

	onMount(() => {
		const mediaQuery = window.matchMedia('(min-width: 768px)');
		const updateLayout = () => {
			showDesktopScene = mediaQuery.matches;
			isLoading = mediaQuery.matches;
		};

		updateLayout();
		mediaQuery.addEventListener('change', updateLayout);
		return () => mediaQuery.removeEventListener('change', updateLayout);
	});
</script>

<main class="contact-page">
	{#if showDesktopScene}
		<section class="screen-reader-context">
			<h1>Contact Jayden Daniel Koek</h1>
			<p>Get in touch with photographer Jayden Daniel Koek for photography enquiries.</p>
			<a href="/">Return to Jayden Daniel Koek’s photography portfolio</a>
		</section>

		<Canvas>
			<Scene {onready} />
		</Canvas>

		<SceneLoadingVeil loaded={!isLoading} />
	{:else}
		<section class="contact-details" aria-labelledby="contact-title">
			<h1 id="contact-title">Jayden Daniel Koek</h1>
			<p class="intro">Photography enquiries and collaborations.</p>

			<dl>
				<div>
					<dt>Email</dt>
					<dd><a href={`mailto:${contactEmail}`}>{contactEmail}</a></dd>
				</div>
				<div>
					<dt>Phone</dt>
					<dd><a href={`tel:${contactPhone.replaceAll(' ', '')}`}>{contactPhone}</a></dd>
				</div>
			</dl>

			<a class="email-button" href={`mailto:${contactEmail}`}>Send email</a>
		</section>
	{/if}
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html:has(.contact-page)),
	:global(body:has(.contact-page)) {
		margin: 0;
		min-height: 100%;
		background: #000;
	}
	main {
		position: relative;
		width: 100vw;
		height: 100svh;
		background: #000;
	}
	.contact-details {
		display: flex;
		min-height: 100%;
		flex-direction: column;
		justify-content: center;
		padding: max(2rem, env(safe-area-inset-top)) 2rem max(2rem, env(safe-area-inset-bottom));
		color: #f5f7f2;
		font-family: system-ui, sans-serif;
	}
	.contact-details h1 {
		max-width: 8ch;
		margin: 0;
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
		font-size: clamp(3.5rem, 15vw, 5.5rem);
		font-weight: 400;
		letter-spacing: -0.07em;
		line-height: 0.82;
	}
	.intro {
		margin: 2rem 0 0;
		color: rgba(245, 247, 242, 0.72);
		font-size: 1rem;
		line-height: 1.45;
	}
	.contact-details dl {
		margin: 3rem 0 0;
	}
	.contact-details dl div {
		padding: 1rem 0;
		border-top: 1px solid rgba(245, 247, 242, 0.25);
	}
	.contact-details dl div:last-child {
		border-bottom: 1px solid rgba(245, 247, 242, 0.25);
	}
	.contact-details dt {
		color: rgba(245, 247, 242, 0.6);
		font-size: 0.75rem;
	}
	.contact-details dd {
		margin: 0.35rem 0 0;
		font-size: 1.05rem;
	}
	.contact-details a {
		color: inherit;
		text-underline-offset: 0.2em;
	}
	.email-button {
		align-self: flex-start;
		margin-top: 2.5rem;
		padding: 0.75rem 0.95rem;
		border: 1px solid rgba(245, 247, 242, 0.85);
		border-radius: 8px;
		background: transparent;
		font-size: 1rem;
		text-decoration: none;
		transition: background-color 160ms ease, color 160ms ease;
	}
	.email-button:hover,
	.email-button:focus-visible {
		background: #f5f7f2;
		color: #000;
	}
	.email-button:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 4px;
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
</style>
