<script lang="ts">
	let { class: className, ...rest } = $props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	{...rest}
>
	<path
		d="M3 4H15M3 9H12M3 14H10"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	/>
	<circle cx="16" cy="16" r="4.5" stroke="currentColor" stroke-width="2" />
	<path d="M19.5 19.5L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
</svg>
