<script>
  import {
    timingObject,
    vidSrc,
    transcriptSrc,
    transcriptLang,
    cueData,
  } from './stores';
  import { onMount, createEventDispatcher } from 'svelte';
  import { setTimingsrc } from 'timingsrc';

  export let height;
  export let volume = 1;
  export let videoElement;
  let transcript = false;
  let container;

  const dispatch = createEventDispatcher();

  onMount(async () => {
    new ResizeObserver(() => (height = container.clientHeight)).observe(
      container
    );
    // this is a weird hack and should probably be done correctly
    container.style.width = '500px';
    if ($transcriptSrc) {
      // widgets are not being properly destroyed. this can be removed if fixed
      transcript = true;
    }
  });

  const setupCues = () => {
    console.log('cues loaded');
    $cueData = [...videoElement.textTracks[0].cues];
  };

  const vidData = () => {
    console.log('videoElement loaded');
    setTimingsrc(videoElement, $timingObject);
    if (videoElement.textTracks[0]) {
      videoElement.textTracks[0].mode = 'hidden';
    }
    dispatch('onMainVidLoad');
  };
</script>

<div>
  <div class="mainVid" bind:this={container}>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
      bind:this={videoElement}
      bind:volume
      on:loadedmetadata|once={vidData}
      src={$vidSrc}
    >
      {#if transcript}
        <track
          on:load|once={setupCues}
          kind="captions"
          type="text/vtt"
          crossorigin="anonymous"
          src={$transcriptSrc}
          srclang={$transcriptLang}
          default
        />
      {/if}
    </video>
  </div>
</div>

<style>
  video {
    height: 100%;
    width: 100%;
    max-width: none;
  }
  .mainVid {
    resize: horizontal;
    overflow: auto;
    /*height: 30vh;*/
    /*width: 50%;*/
    flex: 1000 1000 auto;
    background-color: black;
  }
</style>
