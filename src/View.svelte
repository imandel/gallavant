<script>
  import { setTimingsrc } from 'timingsrc';
  import { onMount } from 'svelte';
  let vid;
  let hide = true;
  let muted = false;
  let pipEnabled; // = 'requestPictureInPicture'
  export let src;
  export let timingSrc;
  onMount(() => {
    pipEnabled = 'requestPictureInPicture' in vid;
    setTimingsrc(vid, timingSrc);
  });
  const pip = () => {
    if (document.pictureInPictureElement === vid) {
      document.exitPictureInPicture();
    } else {
      vid.requestPictureInPicture();
    }
  };
  const mute = () => {
    if (vid.muted) {
      vid.muted = false;
    } else {
      vid.muted = true;
    }
  };
</script>

<div
  class="vid-container"
  on:mouseenter={() => (hide = false)}
  on:mouseleave={() => (hide = true)}
>
  <div class="bttns" class:hidden={hide}>
    {#if pipEnabled}
      <button on:click={pip}> pip </button>
    {/if}
    <button on:click={mute}>{muted ? 'unmute' : 'mute'}</button>
  </div>
  <!-- svelte-ignore a11y-media-has-caption -->
  <video {src} bind:this={vid} bind:muted>
    <slot />
  </video>
</div>

<style>
  .bttns {
    position: absolute;
    z-index: 9000;
  }
  .hidden {
    visibility: hidden;
  }
  video {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
  }
  .vid-container {
    display: inline-block;
    width: fit-content;
  }
</style>
