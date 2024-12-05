<script lang="ts">
	import { createPagination, melt } from '@melt-ui/svelte';
	import { tick } from 'svelte';
	import m from '$lib/script.svelte';

	import ChevronLeft from '~icons/material-symbols/chevron-left';
	import ChevronRight from '~icons/material-symbols/chevron-right';
	import Return from '~icons/material-symbols/keyboard-return';

	let rootNav: HTMLElement;

	let {
		range = $bindable({ start: 0, end: 0 }),
		page = $bindable(1),
		perPage,
		count
	}: {
		range?: { start: number; end: number };
		page?: number;
		perPage: number;
		count: number;
	} = $props();

	let maxPage = $derived(Math.ceil(count / perPage));

	const {
		elements: { root, pageTrigger, prevButton, nextButton },
		states: { pages, range: meltRange, page: meltPage }
	} = createPagination({
		count,
		perPage,
		defaultPage: page,
		siblingCount: 1
	});

	$effect(() => {
		range = $meltRange;
		page = $meltPage;
	});

	$effect(() => {
		if ($meltPage > maxPage) {
			$meltPage = maxPage;
		}
	});

	$effect(() => {
		page;
		gotoPage = page;
		showInput = false;
		tick().then(() => {
			const scrollTo =
				rootNav.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 20;
			window.scrollTo({
				top: scrollTo,
				behavior: 'instant'
			});
		});
	});

	let gotoPage = $state(1);

	let showInput = $state(false);
	let gotoPageInput: HTMLInputElement;
</script>

<nav
	class="my-4 flex flex-col items-center gap-4"
	aria-label="pagination"
	use:melt={$root}
	bind:this={rootNav}
>
	<div class="flex items-center gap-2">
		<button
			class="grid h-8 items-center bg-white px-3 text-sm text-gray-900 shadow-sm
      hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-gray-900
      data-[selected]:text-white"
			title={m.localized('Iotta hoskino an sos', '最初のページ', 'First page')}
			use:melt={$prevButton}><ChevronLeft class="size-4" /></button
		>
		{#each $pages as page (page.key)}
			{#if page.type === 'ellipsis'}
				<span>...</span>
			{:else}
				<button
					class="data=[selected]:font-bold grid h-8 items-center bg-white px-3 text-sm text-gray-900
          shadow-sm hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50
        data-[selected]:bg-gray-900 data-[selected]:text-white"
					title={m.localized(`${page.value} sos`, `${page.value}ページ目`, `Page ${page.value}`)}
					use:melt={$pageTrigger(page)}>{page.value}</button
				>
			{/if}
		{/each}
		<button
			class="grid h-8 items-center bg-white px-3 text-sm text-gray-900 shadow-sm
      hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-gray-900
    data-[selected]:text-white"
			title={m.localized('Iotta iosno an sos', '最後のページ', 'Last page')}
			use:melt={$nextButton}><ChevronRight class="size-4" /></button
		>
		<form
			class="flex h-8 items-center gap-2"
			onsubmit={(e) => {
				e.preventDefault();
				$meltPage = gotoPage;
			}}
		>
			{#if showInput}
				<input
					type="number"
					bind:value={gotoPage}
					min={1}
					max={maxPage}
					bind:this={gotoPageInput}
					class="m-0 h-8 w-12 appearance-none border border-gray-900 bg-white p-2 px-2 py-0 text-sm text-black shadow-hard hover:bg-neutral-200 hover:shadow-harder focus:border-black focus:outline-none focus:ring-black"
				/>
				<button
					type="submit"
					class="grid h-8 items-center bg-white px-3 text-sm text-gray-900 shadow-sm hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
					title={m.localized('Sos or un terke', 'ページにジャンプ', 'Jump to page')}
				>
					<Return class="size-4" />
				</button>
			{:else}
				<button
					class="grid h-8 items-center bg-white px-3 text-sm text-gray-900 shadow-sm hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
					title={m.localized('Sos or un terke', 'ページにジャンプ', 'Jump to page')}
					onclick={() => {
						showInput = true;
						tick().then(() => {
							gotoPageInput.focus();
							gotoPageInput.select();
						});
					}}
				>
					<Return class="size-4" />
				</button>
			{/if}
		</form>
	</div>
</nav>
