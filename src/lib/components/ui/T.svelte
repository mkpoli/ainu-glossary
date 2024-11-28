<script>
	import m from '$lib/script.svelte';

	let { t } = $props();
</script>

<span class="font-ain">{m.t(t)}</span>
