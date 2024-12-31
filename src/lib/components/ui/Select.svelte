<script lang="ts">
	import { createSelect, createSeparator, melt } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';
	import Localized from '$lib/components/ui/Localized.svelte';
	import m from '$lib/script.svelte';
	import T from './T.svelte';

	let {
		options,
		label: labelName = '',
		selected = $bindable(undefined),
		labelClass = '',
		labelStyle = '',
		children
	}: Props = $props();

	export function forceUpdateSelected(selectedCategories: { value: string; label: string }[]) {
		$meltSelected = selectedCategories;
	}

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
				description?: string;
			}
		>;
		label?: string;
		labelClass?: string;
		labelStyle?: string;
		selected?: { value: string; label: string }[] | undefined;
		forceUpdateSelected?: (selectedCategories: { value: string; label: string }[]) => void;
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

	let search = $state('');
	let filteredOptions = $derived(
		[...options.entries()].filter(([value, { label }]) =>
			label.toLowerCase().includes(search.toLowerCase())
		)
	);

	$effect(() => {
		$meltSelected;
		search = '';
	});
</script>

<!-- svelte-ignore a11y_label_has_associated_control - $label contains the 'for' attribute -->
<label class="label {labelClass}" style={labelStyle} use:melt={$label}
	>{@render children?.()}{labelName}</label
>

<button
	class="button m-0 flex h-10 w-full min-w-[220px] items-center justify-between border border-gray-900 bg-white px-3 py-2 text-sm shadow-hard hover:bg-neutral-200 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
	use:melt={$trigger}
	aria-label="Food"
>
	<div class="label">
		{#if !$meltSelected || $meltSelected.length === 0}
			<Localized ain="Inumke" jpn="選択" eng="Select" />
		{:else if $meltSelected.length === 1}
			<span class="capitalize">
				{$selectedLabel}
			</span>
		{:else if $meltSelected.length === options.size}
			<Localized ain="Opitta" jpn="全て" eng="All" />
		{:else}
			<span class="capitalize"
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
	<div
		class="menu absolute z-10 flex max-h-[300px] flex-col bg-white shadow-harder outline-none"
		use:melt={$menu}
	>
		<button
			class="m-0 w-full min-w-[220px] cursor-pointer border border-none border-gray-900 bg-transparent px-4 py-2 text-left text-sm font-bold capitalize text-neutral-500 shadow-hard hover:bg-neutral-50 hover:text-black hover:opacity-90 disabled:text-black"
			disabled={($meltSelected?.length ?? 0) === options.size}
			onclick={() => {
				meltSelected.set([...options.entries()].map(([value, { label }]) => ({ value, label })));
			}}
		>
			<Localized ain="Opitta" jpn="全て" eng="All" />
		</button>
		<hr use:melt={$horizontal} />
		<div class="overflow-y-auto">
			<input type="search" bind:value={search} />
			{#each filteredOptions as [item, { label, count, description }]}
				<div
					class="text-transform relative cursor-pointer bg-white px-8 py-1 text-sm capitalize hover:bg-neutral-50"
					use:melt={$option({ value: item, label })}
					class:bg-neutral-100={$isSelected(item)}
					title={description}
				>
					<div
						class="check {$isSelected(item)
							? 'block'
							: 'hidden'} absolute left-2 top-1/2 -translate-y-1/2"
					>
						✔
					</div>

					{label}<span class="ml-2 text-xs text-neutral-500">{count}</span>
				</div>
			{/each}
		</div>

		<hr use:melt={$horizontal} />
		<button
			class="option m-0 h-10 min-w-[220px] border-none bg-transparent px-4 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-50 hover:text-black"
			onclick={() => {
				meltSelected.set([]);
			}}
			title={m.localized('Inumke isamka', 'すべて選択解除', 'Clear All')}
		>
			<T t="Inumke isamka" />
		</button>
	</div>
{/if}

<style lang="postcss">
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

	hr {
		@apply m-0 border-0 border-t border-neutral-400;
	}
</style>
