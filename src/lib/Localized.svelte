<script lang="ts">
	let { ain, eng, jap }: { ain: string; eng: string; jap: string } = $props();
</script>

<span>
	{ain} / <span lang="en">{eng}</span> / <span lang="ja">{jap}</span>
</span>
