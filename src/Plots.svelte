<script>
  import { plots, curplot } from './stores';
  import { VegaLite } from 'svelte-vega';
  export let position;
  const { config, encoding, layer, mark } = $plots;
  let spec;
  let hidden = false;
  let view;
  let height;
  $: upd(position);
  $: {
    spec = {
      config: { ...config, autosize: 'fit' },
      data: { name: 'curData' },
      height: height - 20,
      mark,
      encoding: { x: encoding.x },
      $schema: 'https://vega.github.io/schema/vega-lite/v4.17.0.json',
      layer: [
        {
          mark,
          encoding,
        },
        {
          params: [
            {
              name: 'ts',
              value: 0,
              select: {
                type: 'point',
                encodings: ['x'],
                on: 'click',
                nearest: true,
              },
            },
          ],
          mark: { type: 'rule' },
          encoding: { opacity: { value: 0 } },
        },
        {
          transform: [{ filter: { and: ['ts', { param: 'ts' }] } }],
          mark: { type: 'rule', color: 'firebrick' },
        },
      ],
    };
  }
  const upd = async (pos) => {
    const nearPoint = $curplot?.curData
      ?.map((e) => e.Video_time)
      .find((v) => v >= pos);
    if (nearPoint) {
      await view
        ?.signal('ts_tuple', {
          unit: 'layer_1',
          fields: [
            {
              field: 'Video_time',
              channel: 'x',
              type: 'E',
            },
          ],
          values: [nearPoint],
        })
        .runAsync();
    }
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="bar"
  on:click={() => {
    hidden = !hidden;
  }}
/>
<div class="plot-container" class:hidden bind:clientHeight={height}>
  <VegaLite bind:view data={$curplot} {spec} options={{ actions: false }} />
</div>

<style>
  .plot-container {
    flex: 1000 1000;
    height: 100%;
    padding: 0.5em;
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
