<script lang="ts">
	import { createSwitch, melt } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';

	let {
		checked = $bindable(false),
		children,
		onchange,
		on,
		id = Math.random().toString(36).substring(2, 15)
	}: {
		checked?: boolean;
		children?: Snippet;
		on?: Snippet;
		onchange?: (checked: boolean) => void;
		id?: string;
	} = $props();

	const {
		elements: { root, input }
	} = createSwitch({
		defaultChecked: checked
	});

	$effect(() => {
		checked = $input.checked;
		onchange?.(checked);
	});
</script>

<form>
	<div class="flex items-center">
		{#if children}
			<label class="pr-2 leading-none" for={id} id={`${id}-label`}>
				{@render children()}
			</label>
		{/if}
		<button
			use:melt={$root}
			class="relative h-6 cursor-default rounded-full bg-neutral-200 transition-colors hover:bg-neutral-400"
			{id}
			aria-labelledby={`${id}-label`}
		>
			<span class="thumb absolute left-0 top-px block rounded-full bg-white shadow-hard transition"
			></span>
		</button>
		<input use:melt={$input} />
		{#if on}
			<label class="pl-2 leading-none" for={id} id={`${id}-label`}>
				{@render on()}
			</label>
		{/if}
	</div>
</form>

<style>
	button {
		--w: 2.75rem;
		--padding: 0.125rem;
		width: var(--w);
	}

	.thumb {
		--size: 1.25rem;
		width: var(--size);
		height: var(--size);
		transform: translateX(var(--padding));
	}

	:global([data-state='checked']) .thumb {
		transform: translateX(calc(var(--w) - var(--size) - var(--padding)));
	}
</style>
