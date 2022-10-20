<script>
  import { plots, curplot } from './stores';
  import { VegaLite } from 'svelte-vega';
  $: data = { table: $curplot };
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.2.0.json',
    config: {
      view: {
        continuousHeight: 300,
        continuousWidth: 400,
      },
    },
    data: {
      name: 'table',
    },
    layer: [
      {
        encoding: {
          x: {
            field: 'Video_time',
            type: 'quantitative',
          },
          y: {
            field: 'Ego_speed',
            type: 'quantitative',
          },
        },
        mark: {
          point: false,
          type: 'line',
        },
      },
      {
        mark: { type: 'rule' },
        encoding: {
          "x": {"field": "Video_time", "aggregate": "mean"},
        },
      },
    ],
  };
</script>

<VegaLite {data} {spec} />
