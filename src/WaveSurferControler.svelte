<script>
  import {
    curKeypoint,
    timingObject,
    keypoints,
    review,
    peaksSrc,
  } from './stores';
  import WaveSurfer from 'wavesurfer.js';
  import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
  import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
  import { onMount, onDestroy } from 'svelte';

  export let videoElement;
  export let position;
  export let velocity;
  export let sendBackendMsg;
  export let volume = 1;
  export const tagAction = (action) => {
    actionState = true;
    switch (action) {
      case 'save':
        saveTag();
        break;
      case 'delete':
        deleteTag();
        break;
      default:
        break;
    }
    actionState = false;
    return true;
  };
  export const toggleHideSaved = () => {
    hideSaved = !hideSaved;
    return true;
  };

  let hideSaved = false;
  let wavesurfer;
  let waveform;
  let regionPlayed;
  let activeRegion;

  let pxSec = 0;
  let speeds = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2, 4, 8];
  let volHidden = true;
  let zoomHidden = true;

  let previousRegion;
  let mouseover = false;
  let actionState = false;
  let onHidesaveChanged = (hideSaved) => {
    if (wavesurfer?.regions?.list) {
      if (hideSaved) {
        Object.values(wavesurfer.regions.list)
          .filter((region) => region?.data?.saved && region !== activeRegion)
          .forEach((region) => (region.element.style.visibility = 'hidden'));
      } else {
        Object.values(wavesurfer.regions.list).forEach(
          (region) => (region.element.style.visibility = 'visible')
        );
      }
      return true;
    }
  };
  $: onHidesaveChanged(hideSaved);
  $: if (wavesurfer && $curKeypoint.start) {
    if (
      activeRegion &&
      (activeRegion.start !== $curKeypoint.start ||
        activeRegion.end !== $curKeypoint.end)
    ) {
      activeRegion.update({ start: $curKeypoint.start, end: $curKeypoint.end });
    } else if (!activeRegion) {
      activeRegion = wavesurfer.addRegion({
        start: $curKeypoint.start,
        end: $curKeypoint.end,
        color: 'rgba(255, 255, 0, 0.4)',
        id: $curKeypoint.id,
      });
      activeRegion = activeRegion;
      previousRegion = activeRegion;
    }
  }

  export const vidLoaded = () => {
    if ($peaksSrc) {
      console.log('peaks', $peaksSrc);
      fetch($peaksSrc)
        .then((response) => {
          if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
          }
          return response.json();
        })
        .then((peaks) => {
          console.log('loaded peaks!');
          // load peaks into wavesurfer.js
          wavesurfer.load(videoElement, peaks.data);
        })
        .catch((e) => {
          console.error('error', e);
        });
    } else {
      wavesurfer.load(videoElement);
    }
  };

  const updateZoom = (pxSec) => {
    wavesurfer.zoom(pxSec);
    // width = waveform.querySelector('wave').scrollWidth
  };

  export const selectNextTag = (direction) => {
    let sorted;
    let nextRegion;
    let visible = Object.values(wavesurfer.regions.list).filter(
      (region) => region.element.style.visibility !== 'hidden'
    );
    if (direction === 'forward') {
      sorted = visible.sort((a, b) => {
        return a.start - b.start;
      });
      nextRegion =
        sorted.find((region) => region.start > previousRegion.start) ||
        sorted[0];
    } else if (direction === 'reverse') {
      sorted = visible.sort((a, b) => {
        return b.start - a.start;
      });
      nextRegion =
        sorted.find((region) => region.start < previousRegion.start) ||
        sorted[0];
    }
    setActiveRegion(nextRegion);
    $timingObject.update({ position: activeRegion.start });
  };

  const updateData = (keypoint, region) => {
    if (keypoint.type == 'tag') {
      region.data.tags = [...region.data.tags, keypoint.value];
    } else if (keypoint.type == 'comment') {
      region.data.comments = keypoint.value;
    }
  };

  const keypointsToRegions = (keypointArray, saved) => {
    const outObj = {};
    const color = saved ? 'rgba(255, 200, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)';
    keypointArray.forEach((keypoint) => {
      let region;
      if (keypoint.id in outObj) {
        region = outObj[keypoint.id];
      } else {
        region = {
          start: keypoint.start,
          end: keypoint.end,
          color: color,
          id: keypoint.id,
          data: {
            color: color,
            saved: saved,
            tags: [],
            comments: '',
            author: keypoint.author || '',
          },
        };
        outObj[keypoint.id] = region;
      }
      updateData(keypoint, region);
    });
    return outObj;
  };

  const regionsToKeypoints = (regions) => {
    return Object.entries(regions)
      .filter(([id, region]) => region.data && region.data.saved)
      .flatMap(([id, region]) => {
        const {
          start,
          end,
          data: { tags = [] },
          data: { comments },
          data: { author = '' },
        } = region;
        const shared = { id, start, end, author, src: $curKeypoint.src };
        const tagValues = tags.map((tag) =>
          Object.assign({ value: tag, type: 'tag' }, shared)
        );
        return [
          ...tagValues,
          Object.assign({ value: comments, type: 'comment' }, shared),
        ];
      });
  };

  const deleteTag = () => {
    $review = $review.filter((kp) => kp.id !== activeRegion.id);
    curKeypoint.resetKeypoint();
    const temp = activeRegion;
    temp.remove();
    $keypoints = regionsToKeypoints(wavesurfer.regions.list);
    activeRegion = null;
  };

  const saveTag = () => {
    $review = $review.filter((kp) => kp.id !== activeRegion.id);
    activeRegion.update({
      color: 'rgba(255, 200, 0, 0.4)',
      id: $curKeypoint.id || activeRegion.id,
      drag: false,
      resize: false,
      data: {
        color: 'rgba(255, 200, 0, 0.4)',
        tags: $curKeypoint.tags,
        comments: $curKeypoint.comments,
        saved: true,
        author: $curKeypoint.author || '',
      },
    });
    if (hideSaved) {
      activeRegion.element.style.visibility = 'hidden';
    }
    activeRegion = null;
    $keypoints = regionsToKeypoints(wavesurfer.regions.list);
    curKeypoint.resetKeypoint();
  };

  const resetPreviousRegion = () => {
    if (previousRegion?.data?.saved) {
      previousRegion.update({
        color: previousRegion.data.color,
        drag: false,
        resize: false,
      });
    } else if (previousRegion) {
      previousRegion.update({ color: 'rgba(0, 0, 0, 0.1)' });
    }
  };

  onMount(async () => {
    curKeypoint.resetKeypoint();
    activeRegion = null;
    wavesurfer = null;
    wavesurfer = WaveSurfer.create({
      container: waveform,
      waveColor: '#bab5ff',
      progressColor: '#1e429f',
      cursorColor: '#1e429f',
      height: 30,
      responsive: true,
      normalize: true,
      backend: 'MediaElement',
      partialRender: false,
      zoomDebounce: 100,
      // hideScrollbar: true,
      plugins: [
        CursorPlugin.create({
          showTime: true,
          opacity: 1,
          formatTimeCallback: (time) => {
            return new Date(time * 1000).toISOString().substr(11, 8);
          },
          customShowTimeStyle: {
            'background-color': '#000',
            color: '#fff',
            padding: '2px',
            'font-size': '10px',
          },
        }),
        RegionsPlugin.create({
          dragSelection: true,
          color: 'rgba(255, 255, 0, 0.4)',
        }),
      ],
    });

    wavesurfer.on('waveform-ready', () => {
      console.log('ready');
      syncKeypoints();
      if (!$peaksSrc) {
        wavesurfer.exportPCM(1024, 10000, true).then((peaks) => {
          const srcArray = new URL(videoElement.src).pathname.split('/');
          sendBackendMsg('peaks_loaded', {
            src: srcArray[srcArray.length - 1],
            data: peaks,
          });
        });
      }
      activeRegion = null;
      // TODO: this is a hacky fix, do better
      updateZoom(1);
      updateZoom(0);
    });
    wavesurfer.on('error', (err) => {
      console.log(err);
    });

    wavesurfer.on('region-click', (region, e) => {
      setActiveRegion(region);
      // TODO have stop at end or region now that using timingsrc
      if (e.shiftKey) {
        e.stopPropagation();
        $timingObject.update({ position: region.start, velocity: 1 });
        regionPlayed = region;
      }
    });

    wavesurfer.on('region-updated', (region) => {
      if (region === activeRegion) {
        $curKeypoint.start = region.start;
        $curKeypoint.end = region.end;
        // hacky way to ensure id from interaction with wavesurfer
        if (mouseover) {
          $curKeypoint.id = region.id;
        }
      }
      // activeRegion = region;
    });

    wavesurfer.on('region-update-end', (region) => {
      $keypoints = regionsToKeypoints(wavesurfer.regions.list);
      previousRegion = activeRegion;
    });

    wavesurfer.on('region-created', (region) => {
      resetPreviousRegion();
      $curKeypoint.tags = [];
      activeRegion = region;
      $curKeypoint.id = $curKeypoint.id || region.id;
    });

    wavesurfer.on('region-out', (region) => {
      if (region == regionPlayed) {
        $timingObject.update({ velocity: 0 });
      }
      regionPlayed = null;
    });
    wavesurfer.on('seek', (pos) => {
      $timingObject.update({ position: pos * wavesurfer.getDuration() });
    });
    wavesurfer.on('region-mouseenter', (e) => {
      mouseover = true;
    });
    wavesurfer.on('region-mouseleave', (e) => {
      mouseover = false;
    });
  });
  export const syncKeypoints = () => {
    wavesurfer.clearRegions();
    const tempKeypoints = Object.values(keypointsToRegions($keypoints, true));
    const tempReview = Object.values(keypointsToRegions($review, false));
    const combined = [...tempKeypoints, ...tempReview];
    combined.forEach((keypoint) => {
      const region = wavesurfer.addRegion(keypoint);
      region.update({ drag: false, resize: false });
      activeRegion = null;
      curKeypoint.resetKeypoint();
    });
  };

  export const someFunc = (e) => console.log('func');
  export const setActiveRegion = (region) => {
    if (typeof region === 'string') {
      // allow for id or region
      region = wavesurfer.regions.list[region];
    }
    resetPreviousRegion();
    region.update({
      color: 'rgba(255, 255, 0, 0.4)',
      drag: true,
      resize: true,
    });
    activeRegion = region;
    $curKeypoint.start = region.start;
    $curKeypoint.end = region.end;
    $curKeypoint.id = region.id;
    sendBackendMsg('keypoint_clicked',{start: region.start, end: region.end})
    if (region.data) {
      $curKeypoint.tags = region.data.tags || [];

      $curKeypoint.comments = region.data.comments;
    }
    previousRegion = region;
    return activeRegion;
  };
</script>

<div bind:this={waveform} style="position: relative;" />
<div class="container">
  <button
    on:click={() => {
      $timingObject.updatePos(-10);
    }}
  >
    &lt&lt
  </button>
  <button
    on:click={() => {
      $timingObject.updatePos(-0.03333333333);
    }}
  >
    &lt
  </button>
  <button
    on:click={() => {
      $timingObject.togglePlay();
    }}>{velocity ? 'pause' : 'play'}</button
  >
  <button
    on:click={() => {
      $timingObject.updatePos(0.03333333333);
    }}
  >
    &gt;
  </button>
  <button
    on:click={() => {
      $timingObject.updatePos(10);
    }}
  >
    &gt;&gt;
  </button>
  <!-- svelte-ignore a11y-no-onchange -->
  <select
    bind:value={$timingObject.playingVelocity}
    on:change={() => {
      if (velocity) {
        $timingObject.update({ velocity: $timingObject.playingVelocity });
      }
    }}
  >
    {#each speeds as speed}
      <option value={speed}>{speed}</option>
    {/each}
  </select>
  <span>{new Date(position * 1000).toISOString().substr(11, 8)}</span>
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <div
    style="display: inline-block;"
    on:mouseover={() => {
      volHidden = false;
    }}
    on:mouseout={() => {
      volHidden = true;
    }}
  >
    🔈 <div class="popup" class:hidden={volHidden}>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={volume}
      /><span>{volume}</span>
    </div>
  </div>
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <div
    style="display: inline-block;"
    on:mouseover={() => {
      zoomHidden = false;
    }}
    on:mouseout={() => {
      zoomHidden = true;
    }}
  >
    🔍 <div class="popup" class:hidden={zoomHidden}>
      <input
        on:mouseup={() => {
          updateZoom(pxSec);
        }}
        type="range"
        min="0"
        max="500"
        step="1"
        bind:value={pxSec}
      /><span>{pxSec}</span>
    </div>
  </div>
  <label>hide saved: <input type="checkbox" bind:checked={hideSaved} /></label>
</div>

<style>
  .hidden {
    display: none;
  }
  input[type='range'] {
    transform: rotate(90deg);
    transform-origin: left;
    width: 70px;
    margin-top: 12px;
    margin-left: -12px;
    cursor: pointer;
    width: 100px !important;
    -webkit-appearance: none;
    z-index: 9000;
    width: 50px;
    border: 1px solid #e6e6e6;
    background-color: #e6e6e6;
    background-image: -webkit-gradient(
      linear,
      0% 0%,
      0% 100%,
      from(#e6e6e6),
      to(#d2d2d2)
    );
    background-image: -webkit-linear-gradient(right, #e6e6e6, #d2d2d2);
    background-image: -moz-linear-gradient(right, #e6e6e6, #d2d2d2);
    background-image: -ms-linear-gradient(right, #e6e6e6, #d2d2d2);
    background-image: -o-linear-gradient(right, #e6e6e6, #d2d2d2);
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;
    overflow: hidden;
    /*position: absolute;*/
  }

  input[type='range']:focus {
    border: 0 !important;
    outline: none !important;
  }
  input[type='range']::-webkit-slider-runnable-track {
    box-shadow: none;
    border: none;
    background: transparent;
    -webkit-appearance: none;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    background-color: #555;
    background-image: -webkit-gradient(
      linear,
      0% 0%,
      0% 100%,
      from(#4ddbff),
      to(#00ccff)
    );
    background-image: -webkit-linear-gradient(right, #4ddbff, #00ccff);
    background-image: -moz-linear-gradient(right, #4ddbff, #00ccff);
    background-image: -ms-linear-gradient(right, #4ddbff, #00ccff);
    background-image: -o-linear-gradient(right, #4ddbff, #00ccff);
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -o-border-radius: 5px;
  }

  input[type='checkbox'] {
    vertical-align: middle;
    margin-bottom: 0px;
    margin-top: 0px;
  }
  .popup {
    position: absolute;
    display: inline-block;
    z-index: 9000;
  }
</style>
