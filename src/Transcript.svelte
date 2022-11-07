<script>
	import { onMount, tick } from 'svelte';
	import { curKeypoint, keypointDefined, timingObject, cueData } from './stores';
	import { getId } from './util'
	let transcriptBox;
	let currentCue;
	let vid;
	let highlights = [];
	let selecting = false;
	let hidden = false;
	onMount(()=>{
		$cueData.forEach((cue)=> {
        const activeNode = transcriptBox.childNodes[cue.id -1]
			cue.onenter = () => {
				currentCue= cue.id -1

				const middleOffset = transcriptBox.getBoundingClientRect().height / 2;
				transcriptBox.scrollTo({left: 0, top: activeNode.offsetTop - middleOffset, behavior: 'smooth' })
			}
		})

	})


	// $: if($keypointDefined.start && $keypointDefined.end){
	$: if($curKeypoint.start && $curKeypoint.end){
		const children = transcriptBox?.children || []
		const nodes = [...children]
		// nodes.forEach(p => p.classList.remove('activeLine'))
		const filtered = nodes.filter((p) => {
			const startTime = parseFloat(p.dataset.starttime)
			const endTime = parseFloat(p.dataset.endtime)
			return  startTime >= $curKeypoint.start && endTime <= $curKeypoint.end
		})
		highlights = filtered.map(p=> parseInt(p.dataset.idx))
	} else {
		highlights = [];
	}


	const getNodeRange = (start, end) => {
		if(start && end){
		let nodes = [start];
		let cur = start.nextSibling;
		let endNode = end.nextSibling;
		while(cur !== endNode){
			console.log(cur)
			nodes.push(cur)
			cur = cur.nextSibling;
		}
		return nodes
	}
}

	const selection = (e) => {
		if(selecting && window.getSelection().toString()){
			const selected = window.getSelection();
			const nodes = [selected.anchorNode.parentNode.closest('p'), 
						   selected.focusNode.parentNode.closest('p')]
			if(nodes.every(Boolean)){
				const timeBounds = nodes.flatMap( p=> [parseFloat(p.dataset.starttime), parseFloat(p.dataset.endtime)])
				const start = Math.min(...timeBounds);
				const end = Math.max(...timeBounds);
				$curKeypoint.start=start
				$curKeypoint.end=end
				// $curTime = end
				$timingObject.update({position:end}) 
		}
	}
}

</script>
<style>
	.transcript-container {
		flex: 1000 1000;
		padding: 0.5em;
		display: block;
		overflow: auto;
	}
	.activeLine {
		font-size: 1.1em;
	}
	.highlighted {
		background-color: yellow;	
	}
	.bold {
		font-weight: bold;
	}
	.bar {
		width: 8px;
		background-color: gray;
		border-left: 2px solid;
	}

	.hidden {
		display: none;
	}


</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bar" on:click={()=>{hidden=!hidden}}></div>
<div class='transcript-container'
	 bind:this={transcriptBox}
	 on:mousedown={(e)=>{if(e.shiftKey){selecting=true; $curKeypoint.id = getId('transcript_')}}}
	 on:mousemove={selection}
	 on:mouseup={(e)=>{if(selecting){selection(e);selecting=false; window.getSelection().empty()}}}
	 class:hidden
	 >

	 
	 {#each $cueData as cue, index}
	 <!-- svelte-ignore a11y-click-events-have-key-events -->
	 <p class:activeLine={index===currentCue}
	 	class:highlighted = {highlights.includes(index)}
	 	on:click ={()=>{$timingObject.update({position:cue.startTime})}}
	 	data-startTime={cue.startTime}
	 	data-endTime={cue.endTime}
	 	data-idx={index}
	 >
	 	<span class = 'bold'>{new Date(cue.startTime * 1000).toISOString().substr(11, 8)}-{new Date(cue.endTime * 1000).toISOString().substr(11, 8)}</span>: {cue.text}
	 </p>
	 {/each}
</div>