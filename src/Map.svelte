<script>
  import { gpx } from '@tmcw/togeojson';
  import mapboxgl from 'mapbox-gl';
  import { onMount, onDestroy } from 'svelte';
  import { point } from '@turf/helpers';
  import { getId } from './util';
  import nearestPointOnLine from '@turf/nearest-point-on-line';

  import { curKeypoint, timingObject, mapStyle, gps } from './stores.ts';
  let mapRef;
  let line;
  let container;
  let route;
  let start;
  let keyOrigin;
  let hidden = false;

  export let position;

  let geojsonPoint = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      },
    ],
  };

  const updatePos = (time) => {
    if (time && route.features[0].properties.coordinateProperties.times) {
      const times = route.features[0].properties.coordinateProperties.times;
      const line = route.features[0].geometry.coordinates;
      const index = times.findIndex((n) => n > time);

      // finds next time (ordered)
      const currentJson = line.slice(0, index);
      const head = line[index];
      const movingLine = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: currentJson,
            },
          },
        ],
      };
      mapRef.getSource('lineSource').setData(movingLine);
      mapRef.getSource('pointSource').setData(point(head));
    }
  };

  const updateKeypoint = (start, end) => {
    if (route.features[0].properties.coordinateProperties.times) {
      const times = route.features[0].properties.coordinateProperties.times;
      const line = route.features[0].geometry.coordinates;
      const startIdx = times.findIndex((n) => n > start);
      const endIdx = times.findIndex((n) => n > end);
      const currentJson = line.slice(startIdx, endIdx);
      const markedLine = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: currentJson,
            },
          },
        ],
      };
      mapRef.getSource('keyLineSource')?.setData(markedLine);
    }
  };
  const nearPointTime = (lngLat) => {
    const nearPoint = nearestPointOnLine(route, Object.values(lngLat));
    return route.features[0].properties.coordinateProperties.times[
      nearPoint.properties.index
    ];
  };

  // TODO: fix/clean this
  const updateLocation = (e) => {
    const time = nearPointTime(e.lngLat);
    if (e.originalEvent.shiftKey) {
      if (time >= keyOrigin) {
        $curKeypoint.start = keyOrigin;
        $curKeypoint.end = time;
      } else {
        $curKeypoint.end = keyOrigin;
        $curKeypoint.start = time;
      }
    }
    $timingObject.update({ position: time });
  };

  const onUp = (e) => {
    mapRef.off('mousemove', updateLocation);
  };

  $: if (mapRef && mapRef.getSource('lineSource')) {
    updatePos(position);
  }
  $: if (mapRef) {
    updateKeypoint($curKeypoint.start, $curKeypoint.end);
  }

  onMount(async () => {
    if ($gps) {
      const res = await fetch($gps).catch((err) => {
        console.error(err);
      });
      const fileType = res.headers.get('Content-Type');
      console.log(res, fileType);
      if (fileType === 'application/gpx+xml') {
        const routeString = await res.text();
        route = await gpx(
          new DOMParser().parseFromString(routeString, 'text/xml')
        );
      } else {
        console.log(res, fileType);
        route = await res.json();
      }
      if (route.features[0].properties.time !== 0) {
        if (typeof route.features[0].properties.time == 'string')
          start = Date.parse(route.features[0].properties.time);
        route.features[0].properties.coordinateProperties.times =
          route.features[0].properties.coordinateProperties.times.map(
            (time) => (Date.parse(time) - start) / 1000
          );
      }

      mapboxgl.accessToken =
        'pk.eyJ1IjoiaW1hbmRlbCIsImEiOiJjankxdjU4ODMwYTViM21teGFpenpsbmd1In0.IN9K9rp8-I5pTbYTmwRJ4Q';

      // Create the map
      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });
      mapRef = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: [153.0234991, -27.4689682],
        zoom: 13,
      });
      mapRef.on('load', () => {
        mapRef.boxZoom.disable();
        new ResizeObserver(() => mapRef.resize()).observe(container);
        mapRef.resize();
        console.log('map loaded');
        const coordinates = route.features[0].geometry.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        mapRef.fitBounds(bounds, {
          padding: 30,
        });
        mapRef.addSource('lineSource', {
          type: 'geojson',
          data: geojsonPoint,
        });

        mapRef.addSource('keyLineSource', {
          type: 'geojson',
          data: geojsonPoint,
        });

        mapRef.addSource('fullLineSource', {
          type: 'geojson',
          data: route,
        });

        mapRef.addSource('pointSource', {
          type: 'geojson',
          data: geojsonPoint,
        });

        mapRef.addLayer({
          id: 'staticLine',
          type: 'line',
          source: 'fullLineSource',
          paint: {
            // 'line-opacity': 0.5,
            'line-color': '#bab5ff',
            'line-width': 4.5,
          },
          layout: {
            // 'visibility': 'none'
          },
        });

        mapRef.addLayer({
          id: 'animatedLine',
          type: 'line',
          source: 'lineSource',
          paint: {
            'line-opacity': 1,
            'line-color': '#1e429f',
            'line-width': 4.5,
          },
          layout: {
            // 'visibility': 'none'
          },
        });

        mapRef.addLayer({
          id: 'keyLine',
          type: 'line',
          source: 'keyLineSource',
          paint: {
            // 'line-opacity': 0.5,
            'line-color': '#FFFF00',
            'line-width': 4.5,
          },
          layout: {
            // 'visibility': 'none'
          },
        });

        mapRef.addLayer({
          id: 'animatedPoint',
          type: 'circle',
          source: 'pointSource',
          paint: {
            'circle-radius': 5,
            'circle-opacity': 1,
            'circle-color': '#1e429f',
          },
          layout: {
            // 'visibility': 'none'
          },
        });
        // for saving temp files, come back to this later TODO
        // setTimeout(()=>mapLoaded(gpsPath), 1000)

        mapRef.on('mouseenter', 'staticLine', (e) => {
          mapRef.getCanvasContainer().style.cursor = 'crosshair';

          const time = nearPointTime(e.lngLat);
          popup
            .setLngLat(e.lngLat)
            .setText(new Date(time * 1000).toISOString().substr(11, 8))
            .addTo(mapRef);
        });

        mapRef.on('mouseleave', 'staticLine', () => {
          mapRef.getCanvasContainer().style.cursor = '';
          popup.remove();
        });
        mapRef.on('mousemove', 'staticLine', (e) => {
          const time = nearPointTime(e.lngLat);
          popup
            .setText(new Date(time * 1000).toISOString().substr(11, 8))
            .setLngLat(e.lngLat);
        });

        mapRef.on('mousedown', 'staticLine', (e) => {
          e.preventDefault();
          const time = nearPointTime(e.lngLat);
          if (e.originalEvent.shiftKey) {
            $curKeypoint.start = time;
            keyOrigin = time;
            $curKeypoint.id = getId('map_');
          }

          $timingObject.update({ position: time });
          // updateLocation(e)
          mapRef.on('mousemove', updateLocation);
          mapRef.once('mouseup', onUp);
        });

        mapRef.getSource('pointSource').setData(point(coordinates[0]));
      });
    }
  });

  // onDestroy(()=>{
  //   if(mapRef) mapRef.remove();
  //   console.log('destroy map')
  //   // $gps=null;
  // })
</script>

<svelte:head>
  <link
    href="https://api.mapbox.com/mapbox-gl-js/v2.6.0/mapbox-gl.css"
    rel="stylesheet"
  />
</svelte:head>

<!-- map not hiding on click? TODO -->
<div
  class="bar"
  on:click={() => {
    hidden = !hidden;
  }}
/>
<div class="map-container">
  <div bind:this={container} class="map" />
</div>

<style>
  .map {
    width: 100%;
    height: 100%;
  }
  .map-container {
    flex: 1000 1000;
    width: 100%;
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
