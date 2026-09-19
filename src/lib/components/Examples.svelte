<script lang="ts">
	import type { Example } from '$lib/server/corpus';
	import Localized from '$lib/components/ui/Localized.svelte';

	let { expr, examples }: { expr: string; examples: Example[] } = $props();
</script>

{#if examples.length}
	<section class="flex flex-col gap-4 border border-black px-6 py-4 shadow-hard">
		<h2 class="m-0 text-lg font-bold">
			<Localized ain="Itaksay" jpn="用例" eng="Examples" />
		</h2>
		<ul class="flex flex-col gap-3">
			{#each examples as example (example.id)}
				<li class="flex flex-col gap-1">
					<p lang="ain" class="m-0">{example.text}</p>
					{#if example.translation}
						<p lang="ja" class="m-0 text-neutral-600">{example.translation}</p>
					{/if}
					{#if example.source}
						<p class="m-0 text-sm text-neutral-500">
							{#if example.uri}
								<a href={example.uri} target="_blank" class="hover-underline">{example.source}</a>
							{:else}
								{example.source}
							{/if}
						</p>
					{/if}
				</li>
			{/each}
		</ul>
		<a
			href={`https://corpus.aynu.org/?q=${encodeURIComponent(expr)}`}
			target="_blank"
			class="hover-underline text-sm"
		>
			<Localized
				ain="Aynu Kampisos or ta poronno itaksay a=nukar"
				jpn="アイヌ・カムピソスでもっと用例を見る"
				eng="More at Aynu Kampisos hunara"
			/>
		</a>
	</section>
{/if}
