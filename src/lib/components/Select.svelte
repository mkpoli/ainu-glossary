<script lang="ts">
	import { createSelect, createSeparator, melt } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';

	let {
		options,
		label: labelName = '',
		selected = $bindable(undefined),
		children
	}: Props = $props();

	const {
		elements: { trigger, menu, option, label },
		states: { selected: meltSelected, selectedLabel, open },
		helpers: { isSelected }
	} = createSelect({
		defaultSelected: [...options.entries()].map(([value, { label }]) => ({ value, label })),
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		multiple: true
	});

	interface Props {
		options: Map<
			string,
			{
				label: string;
				count: number;
			}
		>;
		label?: string;
		selected?: { value: string; label: string }[] | undefined;
		children?: Snippet<[]>;
	}

	$effect(() => {
		selected = $meltSelected;
	});

	const {
		elements: { root: horizontal }
	} = createSeparator({
		orientation: 'horizontal'
	});
</script>

<!-- svelte-ignore a11y_label_has_associated_control - $label contains the 'for' attribute -->
<label class="label" use:melt={$label}>{@render children?.()}{labelName}</label>
<button class="button" use:melt={$trigger} aria-label="Food">
	<div class="label">
		{#if !$meltSelected || $meltSelected.length === 0}
			<span>A=numke</span>
			<span lang="ja">選択</span>
			<span lang="en">Select</span>
		{:else if $meltSelected.length === 1}
			<span>
				{$selectedLabel}
			</span>
		{:else if $meltSelected.length === options.size}
			<span>Opitta</span>
			<span lang="ja">全て</span>
			<span lang="en">All</span>
		{:else}
			<span
				>{$meltSelected
					.slice(0, 3)
					.map(({ label }) => label)
					.join(', ')
					.slice(0, 20)}...</span
			>
		{/if}
	</div>
</button>
{#if $open}
	<div class="menu" use:melt={$menu}>
		<div class="options">
			<button
				class="option select-all"
				disabled={($meltSelected?.length ?? 0) === options.size}
				onclick={() => {
					meltSelected.set([...options.entries()].map(([value, { label }]) => ({ value, label })));
				}}
			>
				<span>opitta</span>
				<span lang="ja">全て</span>
				<span lang="en">All</span>
			</button>
			<hr use:melt={$horizontal} />
			{#each options.entries() as [item, { label, count }]}
				<div
					class="option"
					use:melt={$option({ value: item, label })}
					class:highlighted={$isSelected(item)}
					class:selected={$isSelected(item)}
				>
					<div class="check {$isSelected(item) ? 'block' : 'hidden'}">✔</div>

					{label}<small>{count}</small>
				</div>
			{/each}
		</div>

		<hr use:melt={$horizontal} />
		<button
			class="option select-none"
			onclick={() => {
				meltSelected.set([]);
			}}
			title="Inumke a=isamka / すべて選択解除 / Clear All"
		>
			<span>Inumke a=isamka</span>
			<span lang="ja" class="hidden" aria-hidden="false">すべて選択解除</span>
			<span lang="en" class="hidden" aria-hidden="false">Clear All</span>
		</button>
	</div>
{/if}

<style lang="postcss">
	.label {
		display: block;
	}

	.button {
		display: flex;
		height: 40px;
		min-width: 220px;
		align-items: center;
		justify-content: space-between;
		background-color: white;
		padding: 0.5rem 12px;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.06);
		border: 1px solid #767676;
		font-family: inherit;
		font-size: 0.875rem;
	}
	.button:hover {
		opacity: 0.9;
	}

	/* Chevron */
	.button::after {
		content: '';
		display: inline-block;
		width: 0;
		height: 0;
		margin-left: 0.5em;
		vertical-align: middle;
		border: 0.3em solid;
		border-color: black transparent transparent;
	}

	button span:not(:first-child)::before {
		content: '/';
		margin: 0 8px;
	}

	.menu {
		position: absolute;
		z-index: 10;
		display: flex;
		flex-direction: column;
		max-height: 300px;
		background-color: white;
		box-shadow:
			0 2px 4px -1px rgba(0, 0, 0, 0.2),
			0 1px 3px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.06),
			0 0 0 1px rgba(0, 0, 0, 0.1);
		outline: 0;
	}

	.options {
		overflow-y: auto;
	}

	.select-all {
		padding: 4px 16px;
		font-weight: bold;
		text-transform: capitalize;
	}

	/* Option */
	.option {
		position: relative;
		cursor: pointer;
		padding: 4px 2em;
		text-transform: capitalize;
		font-family: inherit;
		font-size: 0.875rem;
	}

	.option[data-highlighted] {
		background-color: #cccccc;
	}

	.option[data-selected] {
		background-color: #yourMagnum100Color;
		color: #yourMagnum900Color;
	}

	.check {
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translateY(-50%);
		display: none;
	}
	.check.block {
		display: block;
	}

	span {
		text-transform: capitalize;
	}

	hr {
		/* margin: 0.5rem 0; */
		margin: 0;
		border: 0;
		border-top: 1px solid #ccc; /* Replace with actual color */
	}

	button.select-none {
		text-transform: capitalize;
		appearance: none;
		background-color: transparent;
		border: none;
		padding: 0.75rem 1rem;
		font-size: 0.8em;
		color: #888;
		text-align: left;
	}

	button.select-none:hover {
		color: black;
	}

	.hidden {
		display: none;
	}

	button.select-all {
		text-transform: capitalize;
		appearance: none;
		background-color: transparent;
		border: none;
		padding: 4px 1em;
		font-size: 0.8em;
		color: #888;
		text-align: left;
	}

	button.select-all:hover {
		color: black;
	}

	button.select-all:disabled {
		color: black;
	}

	small {
		font-size: 0.8rem;
		color: #888;
		margin-left: 0.5rem;
	}
</style>
