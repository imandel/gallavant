<script>
	import { timingObject } from './stores';
	import { onMount } from 'svelte';
	import View from './View.svelte'
	export let views;
	let hidden = false;

</script>
<style>
	.bar {
		width: 8px;
		background-color: gray;
		border-left: 2px solid;
	}

	.hidden {
		display: none;
	}

	.vids-container {
		display:inline-grid;
		grid-template-rows: repeat(2,minmax(0, 1fr));
		grid-auto-flow: column;
		height:100%;
	}

</style>

<div class="bar" on:click={()=>{hidden=!hidden}}></div>
<div class="views-container" class:hidden>
	<div class="vids-container">
	{#each views as src, i}
			<View class='view' src={src} timingSrc={$timingObject}/>
	{/each}
	</div>
</div>