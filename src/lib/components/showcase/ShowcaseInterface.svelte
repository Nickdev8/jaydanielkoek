<script lang="ts">
	import { ArrowLeft, Volume2 } from '@lucide/svelte';

	let { cameraRotation }: { cameraRotation: number } = $props();

	const dust = Array.from({ length: 34 }, (_, index) => {
		const random = (seed: number) => {
			const value = Math.sin(seed * 918.247) * 43758.5453;
			return value - Math.floor(value);
		};

		return {
			id: index,
			x: random(index + 1) * 100,
			y: random(index + 41) * 100,
			size: 1 + random(index + 81) * 2.5,
			duration: 13 + random(index + 121) * 17,
			delay: -random(index + 161) * 20,
			opacity: 0.14 + random(index + 201) * 0.3
		};
	});
</script>

<div class="interface">
	<div class="screen-dust" aria-hidden="true">
		<div class="screen-dust-drift" style={`--camera-drift: ${Math.sin(cameraRotation) * -4}vw;`}>
			{#each dust as particle (particle.id)}
				<i
					style={`--x: ${particle.x}%; --y: ${particle.y}%; --size: ${particle.size}px; --duration: ${particle.duration}s; --delay: ${particle.delay}s; --opacity: ${particle.opacity};`}
				></i>
			{/each}
		</div>
	</div>

	<header>
		<a class="back" href="/" aria-label="Terug naar het overzicht">
			<ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
			<span>Overzicht</span>
		</a>
	</header>

	<button class="audio" aria-label="Geluidsbediening">
		<Volume2 size={15} strokeWidth={1.5} aria-hidden="true" />
		<span>Geluid</span>
	</button>
</div>

<style>
	.interface,
	.screen-dust {
		position: absolute;
		inset: 0;
	}

	.interface {
		z-index: 2;
		pointer-events: none;
		color: rgba(246, 243, 235, 0.9);
	}

	.screen-dust {
		overflow: hidden;
	}

	.screen-dust-drift {
		position: absolute;
		inset: 0;
		transform: translateX(var(--camera-drift));
		transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.screen-dust i {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background: #f5ead7;
		opacity: var(--opacity);
		filter: blur(0.25px);
		animation: drift var(--duration) linear var(--delay) infinite;
	}

	header {
		position: absolute;
		top: 2.25rem;
		left: 50%;
		width: min(100% - 3rem, 80rem);
		transform: translateX(-50%);
		text-align: center;
	}

	.back,
	.audio {
		pointer-events: auto;
		color: inherit;
	}

	.back {
		position: absolute;
		right: 0;
		top: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.42rem;
		border-bottom: 1px solid rgba(246, 243, 235, 0.42);
		padding-bottom: 0.35rem;
		font:
			500 0.68rem/1 ui-monospace,
			SFMono-Regular,
			Menlo,
			monospace;
		letter-spacing: 0.13em;
		text-decoration: none;
		text-transform: uppercase;
	}

	.audio {
		position: absolute;
		right: 2.25rem;
		bottom: 1.75rem;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.7rem;
		border: 1px solid rgba(246, 243, 235, 0.22);
		border-radius: 999px;
		font:
			500 0.67rem/1 ui-monospace,
			SFMono-Regular,
			Menlo,
			monospace;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	@keyframes drift {
		from {
			transform: translate3d(-7vw, -1vh, 0);
		}
		to {
			transform: translate3d(12vw, 3vh, 0);
		}
	}

	@media (max-width: 600px) {
		header {
			top: 1.4rem;
		}

		.audio {
			right: 1.25rem;
			bottom: 1.2rem;
		}
	}
</style>
