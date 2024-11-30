<script lang="ts">
	import m from '$lib/script.svelte';
	import type { Segment } from '$lib/segment';

	let { t }: { t: string | readonly Segment[] } = $props();
</script>

<span class="font-ain">
	{#if typeof t === 'string'}
		{m.t(t)}
	{:else}
		{#each t as { subsegments }}
			{#each subsegments as { highlighted, content }}
				{#if highlighted}
					<span
						class="relative after:absolute after:bottom-1 after:left-0 after:right-0 after:-z-10 after:h-1 after:bg-theme-400/40 after:content-['']"
						>{content}</span
					>
				{:else}
					{content}
				{/if}
			{/each}
		{/each}
	{/if}
</span>
