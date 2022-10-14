<script lang="ts">
  import { cueData, gps, views, timingObject, curKeypoint } from './stores';
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
  import { processKey, keyConfig } from './util';
  console.log('beepbeee2p')
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
    // "quicktag": (e: KeyboardEvent) => {
    //   const idx = tagbox.shortcuts.indexOf(e.key)
    //   if (tagbox.quickTag && idx >=0){ tagbox.tagChecks.children[idx].firstElementChild.click() }
    // }
  };

  // TODO: move this functionality into custom store
  const updateTiming = () => {
    ({ velocity, position } = $timingObject.query());
    requestAnimationFrame(updateTiming);
  };

  onMount(() => {
    widget.onkeydown = (e) => processKey(e, config);
    //
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
    <MainVid
      bind:height
      bind:videoElement
      bind:volume
      on:onMainVidLoad={wavesurfercontroller.vidLoaded()}
    />


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
    <Plots>
    <html>
<head>
  <style>
    .error {
        color: red;
    }
  </style>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm//vega@5"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm//vega-lite@5.2.0"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm//vega-embed@6"></script>
</head>
<body>
  <div id="vis"></div>
  <script>
    (function(vegaEmbed) {
      var spec = {"config": {"view": {"continuousWidth": 400, "continuousHeight": 300}}, "data": {"name": "data-8644466b8b25777df0ba70fce8037eac"}, "mark": {"type": "line", "point": false}, "encoding": {"x": {"field": "index", "type": "quantitative"}, "y": {"field": "Ego_speed", "type": "quantitative"}}, "$schema": "https://vega.github.io/schema/vega-lite/v5.2.0.json", "datasets": {"data-8644466b8b25777df0ba70fce8037eac": [{"index": 15510, "Ego_speed": 81}, {"index": 15511, "Ego_speed": 81}, {"index": 15512, "Ego_speed": 81}, {"index": 15513, "Ego_speed": 81}, {"index": 15514, "Ego_speed": 81}, {"index": 15515, "Ego_speed": 81}, {"index": 15516, "Ego_speed": 82}, {"index": 15517, "Ego_speed": 82}, {"index": 15518, "Ego_speed": 82}, {"index": 15519, "Ego_speed": 82}, {"index": 15520, "Ego_speed": 82}, {"index": 15521, "Ego_speed": 81}, {"index": 15522, "Ego_speed": 81}, {"index": 15523, "Ego_speed": 81}, {"index": 15524, "Ego_speed": 81}, {"index": 15525, "Ego_speed": 81}, {"index": 15526, "Ego_speed": 81}, {"index": 15527, "Ego_speed": 81}, {"index": 15528, "Ego_speed": 81}, {"index": 15529, "Ego_speed": 81}, {"index": 15530, "Ego_speed": 81}, {"index": 15531, "Ego_speed": 81}, {"index": 15532, "Ego_speed": 81}, {"index": 15533, "Ego_speed": 81}, {"index": 15534, "Ego_speed": 81}, {"index": 15535, "Ego_speed": 79}, {"index": 15536, "Ego_speed": 79}, {"index": 15537, "Ego_speed": 79}, {"index": 15538, "Ego_speed": 79}, {"index": 15539, "Ego_speed": 79}, {"index": 15540, "Ego_speed": 81}, {"index": 15541, "Ego_speed": 81}, {"index": 15542, "Ego_speed": 81}, {"index": 15543, "Ego_speed": 81}, {"index": 15544, "Ego_speed": 81}, {"index": 15545, "Ego_speed": 81}, {"index": 15546, "Ego_speed": 81}, {"index": 15547, "Ego_speed": 81}, {"index": 15548, "Ego_speed": 81}, {"index": 15549, "Ego_speed": 81}, {"index": 15550, "Ego_speed": 82}, {"index": 15551, "Ego_speed": 82}, {"index": 15552, "Ego_speed": 82}, {"index": 15553, "Ego_speed": 82}, {"index": 15554, "Ego_speed": 82}, {"index": 15555, "Ego_speed": 82}, {"index": 15556, "Ego_speed": 82}, {"index": 15557, "Ego_speed": 82}, {"index": 15558, "Ego_speed": 82}, {"index": 15559, "Ego_speed": 82}, {"index": 15560, "Ego_speed": 84}, {"index": 15561, "Ego_speed": 84}, {"index": 15562, "Ego_speed": 84}, {"index": 15563, "Ego_speed": 84}, {"index": 15564, "Ego_speed": 86}, {"index": 15565, "Ego_speed": 86}, {"index": 15566, "Ego_speed": 86}, {"index": 15567, "Ego_speed": 86}, {"index": 15568, "Ego_speed": 86}, {"index": 15569, "Ego_speed": 89}, {"index": 15570, "Ego_speed": 89}, {"index": 15571, "Ego_speed": 89}, {"index": 15572, "Ego_speed": 89}, {"index": 15573, "Ego_speed": 89}, {"index": 15574, "Ego_speed": 89}, {"index": 15575, "Ego_speed": 89}, {"index": 15576, "Ego_speed": 89}, {"index": 15577, "Ego_speed": 89}, {"index": 15578, "Ego_speed": 89}, {"index": 15579, "Ego_speed": 89}, {"index": 15580, "Ego_speed": 89}, {"index": 15581, "Ego_speed": 89}, {"index": 15582, "Ego_speed": 89}, {"index": 15583, "Ego_speed": 92}, {"index": 15584, "Ego_speed": 92}, {"index": 15585, "Ego_speed": 92}, {"index": 15586, "Ego_speed": 92}, {"index": 15587, "Ego_speed": 92}, {"index": 15588, "Ego_speed": 92}, {"index": 15589, "Ego_speed": 92}, {"index": 15590, "Ego_speed": 92}, {"index": 15591, "Ego_speed": 92}, {"index": 15592, "Ego_speed": 92}, {"index": 15593, "Ego_speed": 92}, {"index": 15594, "Ego_speed": 92}, {"index": 15595, "Ego_speed": 92}, {"index": 15596, "Ego_speed": 92}, {"index": 15597, "Ego_speed": 92}, {"index": 15598, "Ego_speed": 93}, {"index": 15599, "Ego_speed": 93}, {"index": 15600, "Ego_speed": 93}, {"index": 15601, "Ego_speed": 93}, {"index": 15602, "Ego_speed": 93}, {"index": 15603, "Ego_speed": 95}, {"index": 15604, "Ego_speed": 95}, {"index": 15605, "Ego_speed": 95}, {"index": 15606, "Ego_speed": 95}, {"index": 15607, "Ego_speed": 95}, {"index": 15608, "Ego_speed": 93}, {"index": 15609, "Ego_speed": 93}]}};
      var embedOpt = {"mode": "vega-lite"};

      function showError(el, error){
          el.innerHTML = ('<div class="error" style="color:red;">'
                          + '<p>JavaScript Error: ' + error.message + '</p>'
                          + "<p>This usually means there's a typo in your chart specification. "
                          + "See the javascript console for the full traceback.</p>"
                          + '</div>');
          throw error;
      }
      const el = document.getElementById('vis');
      vegaEmbed("#vis", spec, embedOpt)
        .catch(error => showError(el, error));
    })(vegaEmbed);

  </script>
</body>
</html>
    </Plots>
<!--    <Tagbox bind:this={tagbox} bind:position>-->
<!--      {#if $curKeypoint.start}-->
<!--        <button-->
<!--          on:click={() => {-->
<!--            wavesurfercontroller.tagAction('delete');-->
<!--          }}-->
<!--        >-->
<!--          Delete Tag-->
<!--        </button>-->
<!--        <button-->
<!--          on:click={() => {-->
<!--            wavesurfercontroller.tagAction('save');-->
<!--          }}-->
<!--        >-->
<!--          Save Tag-->
<!--        </button>-->
<!--      {/if}-->
<!--    </Tagbox>-->
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
