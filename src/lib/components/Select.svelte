<script lang="ts">
	import { createSelect, createSeparator, melt } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';
	import Localized from '$lib/components/Localized.svelte';

	let {
		options,
		label: labelName = '',
		selected = $bindable(undefined),
		labelClass = '',
		labelStyle = '',
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
		labelClass?: string;
		labelStyle?: string;
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
<label class="label {labelClass}" style={labelStyle} use:melt={$label}
	>{@render children?.()}{labelName}</label
>

<button
	class="button w-full px-3 py-2 h-10 m-0 min-w-[220px] bg-white shadow-hard border border-gray-900 text-sm flex items-center justify-between hover:opacity-90"
	use:melt={$trigger}
	aria-label="Food"
>
	<div class="label">
		{#if !$meltSelected || $meltSelected.length === 0}
			<Localized ain="A=numke" jpn="選択" eng="Select" />
		{:else if $meltSelected.length === 1}
			<span>
				{$selectedLabel}
			</span>
		{:else if $meltSelected.length === options.size}
			<Localized ain="Opitta" jpn="全て" eng="All" />
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
	<div
		class="menu absolute z-10 flex flex-col max-h-[300px] bg-white shadow-harder outline-none"
		use:melt={$menu}
	>
		<div class="overflow-y-auto">
			<button
				class="option w-full px-4 py-1 font-bold text-neutral-500 text-left capitalize bg-transparent border-none h-10 m-0 min-w-[220px] shadow-hard border border-gray-900 text-sm hover:opacity-90 hover:text-black disabled:text-black"
				disabled={($meltSelected?.length ?? 0) === options.size}
				onclick={() => {
					meltSelected.set([...options.entries()].map(([value, { label }]) => ({ value, label })));
				}}
			>
				<Localized ain="Opitta" jpn="全て" eng="All" />
			</button>
			<hr use:melt={$horizontal} />
			{#each options.entries() as [item, { label, count }]}
				<div
					class="relative cursor-pointer px-8 py-1 text-transform capitalize text-sm bg-white hover:bg-neutral-50"
					use:melt={$option({ value: item, label })}
					class:bg-neutral-100={$isSelected(item)}
				>
					<div
						class="check {$isSelected(item)
							? 'block'
							: 'hidden'} absolute left-2 top-1/2 -translate-y-1/2"
					>
						✔
					</div>

					{label}<span class="text-xs text-neutral-500 ml-2">{count}</span>
				</div>
			{/each}
		</div>

		<hr use:melt={$horizontal} />
		<button
			class="py-2 px-4 option capitalize text-left bg-transparent border-none h-10 m-0 min-w-[220px] text-sm hover:bg-neutral-50 hover:text-black text-neutral-500"
			onclick={() => {
				meltSelected.set([]);
			}}
			title="Inumke a=isamka / すべて選択解除 / Clear All"
		>
			Inumke a=isamka
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
