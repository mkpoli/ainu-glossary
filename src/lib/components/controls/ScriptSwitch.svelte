<script lang="ts">
	import Switch from '$lib/components/ui/Switch.svelte';
	import m from '$lib/script.svelte';
	let { short = false }: { short?: boolean } = $props();
</script>

<div class="query-form col-span-4 flex items-center justify-center">
	<Switch
		checked={m.script === 'Kana'}
		onchange={(checked) => (m.script = checked ? 'Kana' : 'Latn')}
	>
		<span title={m.localized('Romanci', 'ローマ字', 'Latin')}>{short ? 'A' : 'Romanci'}</span>
		{#snippet on()}
			<span title={m.localized('Katakana', 'カタカナ', 'Kana')}>{short ? 'カ' : 'カタカナ'}</span>
		{/snippet}
	</Switch>
</div>
