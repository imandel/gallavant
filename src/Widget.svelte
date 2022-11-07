<script lang="ts">
  import {
    cueData,
    gps,
    views,
    timingObject,
    curKeypoint,
    plots,
  } from './stores';
  import type { DOMWidgetModel } from '@jupyter-widgets/base';
  import { onMount, SvelteComponent } from 'svelte';
  import Map from './Map.svelte';
  import MainVid from './MainVid.svelte';
  import Transcript from './Transcript.svelte';
  import Views from './Views.svelte';
  import WaveSurferControler from './WaveSurferControler.svelte';
  import DataTable from './DataTable.svelte';
  import Tagbox from './Tagbox.svelte';
  import Plots from './Plots.svelte';
  import { processKey } from './util';
  import type { keyConfig } from './util';

  // get model for backend comms
  // https://www.grizzly-hills.com/2020/08/05/jupyter-widgets-sending-custom-event-to-frontend-from-backend/
  export let model: DOMWidgetModel;

  const sendBackendMsg = (event: string, msg: string) => {
    console.log('sending_msg ', event);
    model.send({ event: event, value: msg }, () => {});
  };

  const handleBackendMsg = (e: any) => {
    console.log('backend_msg', e);
    switch (e.type) {
      case 'keypoints_updated':
        wavesurfercontroller.syncKeypoints();
        break;
      default:
        break;
    }
  };

  let position = 0;
  let velocity = 0;
  let volume = 1;
  let widget: HTMLElement;
  let topRow: HTMLElement;
  let videoElement: HTMLVideoElement;
  let height: string;
  let map: boolean = false;
  let wavesurfercontroller: SvelteComponent;
  let tagbox: SvelteComponent;

  const config: keyConfig = {
    'ctrl+KeyQ': (e: KeyboardEvent) => tagbox.toggleQuickTag(),
    'ctrl+KeyS': (e: KeyboardEvent) => wavesurfercontroller.tagAction('save'),
    'ctrl+Backspace': (e: KeyboardEvent) =>
      wavesurfercontroller.tagAction('delete'),
    'ctrl+KeyH': (e: KeyboardEvent) => wavesurfercontroller.toggleHideSaved(),
    'shift+Tab': (e: KeyboardEvent) => {
      e.preventDefault();
      wavesurfercontroller.selectNextTag('reverse');
      return true;
    },
    Tab: (e: KeyboardEvent) => {
      e.preventDefault();
      wavesurfercontroller.selectNextTag('forward');
      return true;
    },
    'shift+ArrowLeft': (e: KeyboardEvent) => {
      $timingObject.updatePos(-10);
      return true;
    },
    'shift+ArrowRight': (e: KeyboardEvent) => {
      $timingObject.updatePos(10);
      return true;
    },
    'shift+Space': (e: KeyboardEvent) => {
      e.preventDefault();
      $timingObject.togglePlay();
      return true;
    },
    quicktag: (e: KeyboardEvent) => tagbox.quickTagAction(e),
    // quicktag: (e: KeyboardEvent) => {
    //   const idx = tagbox.shortcuts.indexOf(e.key);
    //   if (tagbox.quickTag && idx >= 0) {
    //     tagbox.tagChecks.children[idx].firstElementChild.click();
    //   }
    // },
  };

  // TODO: move this functionality into custom store
  const updateTiming = () => {
    ({ velocity, position } = $timingObject.query());
    requestAnimationFrame(updateTiming);
  };

  onMount(() => {
    widget.onkeydown = (e) => processKey(e, config);

    requestAnimationFrame(updateTiming);
    model.on('msg:custom', handleBackendMsg);
    // widgets not being properly destroyed? prevents multiple maps
    if ($gps) map = true;
    // setup static values of curKeypoint
  });

  // TODO: this is hacky and should be done properly with css?
  $: if (topRow) {
    topRow.style.height = `${height}px`;
  }
</script>

<div class="widget" bind:this={widget} tabindex="-1">
  <div class="container" bind:this={topRow}>
    <MainVid
      bind:height
      bind:videoElement
      bind:volume
      on:onMainVidLoad={wavesurfercontroller.vidLoaded()}
    />
    {#if $plots.length}
      <Plots bind:position />
    {/if}
    <!-- TODO? use <svelte:component> to make less verbose -->
    {#if $views.length}
      <Views views={$views} />
    {/if}
    {#if $cueData.length}
      <Transcript />
    {/if}
    {#if map}
      <Map bind:position />
    {/if}
  </div>

  <WaveSurferControler
    bind:this={wavesurfercontroller}
    bind:videoElement
    bind:position
    bind:velocity
    bind:volume
    {sendBackendMsg}
  />

  <div class="bottom-row">
    <div>
      <DataTable
        on:activeRegionChanged={(e) =>
          wavesurfercontroller.setActiveRegion(e.detail)}
      />
    </div>
    <Tagbox bind:this={tagbox} bind:position>
      {#if $curKeypoint.start}
        <button
          on:click={() => {
            wavesurfercontroller.tagAction('delete');
          }}
        >
          Delete Tag
        </button>
        <button
          on:click={() => {
            wavesurfercontroller.tagAction('save');
          }}
        >
          Save Tag
        </button>
      {/if}
    </Tagbox>
  </div>
</div>

<style>
  /* .widget:focus { */
  .widget {
    outline-width: 0;
    /* height: 90vh; */
  }
  .container {
    display: flex;
    flex-direction: row;
    /*overflow: auto;*/
    min-height: 25vh;
  }

  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px;
  }
</style>
