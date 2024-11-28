<script lang="ts">
	import Switch from '$lib/components/ui/Switch.svelte';
	import m from '$lib/script.svelte';
</script>

<div class="query-form col-span-4 flex items-center justify-center">
	<Switch
		checked={m.script === 'Kana'}
		onchange={(checked) => (m.script = checked ? 'Kana' : 'Latn')}
	>
		Romanci{#snippet on()}カタカナ{/snippet}
	</Switch>
</div>
