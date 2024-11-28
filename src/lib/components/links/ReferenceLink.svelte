<script lang="ts">
	import { REFERENCES_URL } from '$lib/consts';
	let { content }: { content: string } = $props();
</script>

{#if content}
	{#each content.split(/((?:<|cf\.) [\p{scx=Han}\p{scx=Hira}\p{scx=Kana}][\p{scx=Han}\p{scx=Hira}\p{scx=Kana}])/u) as ref}
		{#if ref.match(/((?:<|cf\.) [\p{scx=Han}\p{scx=Hira}\p{scx=Kana}][\p{scx=Han}\p{scx=Hira}\p{scx=Kana}])/u)}
			&lt;&nbsp;<a class="hover-underline no-underline" href={REFERENCES_URL} target="_blank"
				>{ref.slice(2)}</a
			>
		{:else}
			{ref}
		{/if}
	{/each}
{/if}
