import type { Writable } from 'svelte/store';
import type { DOMWidgetModel } from '@jupyter-widgets/base';

import { writable, get } from 'svelte/store';

import { TimingObject } from 'timing-object';
import type { ITimingObject } from 'timing-object';

interface VideoTimingObject extends ITimingObject {
  playingVelocity: number;
  togglePlay: () => void;
  updatePos: (timeDelta: number) => void;
}

class VideoTimingObject extends TimingObject {
  constructor() {
    super();
    this.playingVelocity = 1;
    this.togglePlay = () => {
      this.query().velocity
        ? this.update({ velocity: 0 })
        : this.update({ velocity: this.playingVelocity });
    };
    this.updatePos = (timeDelta) => {
      const newTime: number = Math.max(this.query().position + timeDelta, 0);
      this.update({ position: newTime });
    };
  }
}
export const timingObject: Writable<VideoTimingObject> = writable(
  new VideoTimingObject()
);

interface PT {
  src: string;
  author: string;
  id: string | null | undefined;
  start: number | null | undefined;
  end: number | null | undefined;
  tags: Array<string>;
  comments: string | null | undefined;
}

interface WidgetWritable<T> extends Writable<T> {
  setModel: (m: DOMWidgetModel) => void;
}

function createKeypoint() {
  const store: Writable<PT> = writable({
    src: '',
    author: '',
    id: '',
    start: null,
    end: null,
    tags: [],
    comments: null,
  });
  return {
    set: store.set,
    subscribe: store.subscribe,
    resetKeypoint: () => {
      store.update((state: PT) => {
        state.start = null;
        state.end = null;
        state.tags = [];
        state.id = null;
        state.comments = '';
        return state;
      });
    },
    resetKeypointTimes: () => {
      store.update((state: PT) => {
        state.start = null;
        state.end = null;
        state.id = null;
        return state;
      });
    },
    getValues: () => {
      return get(store);
    }, //i can delete this?
  };
}

export function WidgetWritable<T>(name_: string, value_: T): WidgetWritable<T> {
  const name: string = name_;
  const internalWritable: Writable<any> = writable(value_);
  let model: DOMWidgetModel;

  return {
    set: (v: any) => {
      internalWritable.set(v);
      if (model) {
        model.set(name, v);
        model.save_changes();
      }
    },
    subscribe: internalWritable.subscribe,
    update: (func: any) => {
      internalWritable.update((v: any) => {
        const output = func(v);
        if (model) {
          model.set(name, output);
          model.save_changes();
        }
        return output;
      });
    },
    setModel: (m: DOMWidgetModel) => {
      model = m;
      const modelValue = model.get(name);
      console.log(name, modelValue);
      if (modelValue) {
        internalWritable.set(modelValue);
      }
      model.on(
        'change:' + name,
        () => internalWritable.set(model.get(name)),
        null
      );
    },
  };
}

// Declare stores with their associated Traitlets here.
export const gps = WidgetWritable<string>('gps', '');
export const vidSrc = WidgetWritable<string>('src', '');
export const peaksSrc = WidgetWritable<string>('peaks', '');
export const transcriptSrc = WidgetWritable<string>('transcript', '');
export const transcriptLang = WidgetWritable<string>('transcript_lang', '');
export const cueData = writable([]);
export const mapStyle = WidgetWritable<string>('map_style', '');
export const duration = WidgetWritable<string>('duration', '');
export const views = WidgetWritable<Array<string>>('views', []);
export const author = WidgetWritable<string>('author', '');
export const keypoints = WidgetWritable<Array<string>>('_keypoints', []);
export const review = WidgetWritable<Array<string>>('review', []);
export const tags = WidgetWritable<Array<string>>('tags', []);
export const plots = WidgetWritable<string>('plots', '');
export const curplot = WidgetWritable<Array<string>>('_curplot', []);

// Set the model for each store you create.
export function setStoreModels(model: DOMWidgetModel): void {
  gps.setModel(model);
  vidSrc.setModel(model);
  peaksSrc.setModel(model);
  transcriptSrc.setModel(model);
  transcriptLang.setModel(model);
  mapStyle.setModel(model);
  duration.setModel(model);
  views.setModel(model);
  author.setModel(model);
  keypoints.setModel(model);
  review.setModel(model);
  tags.setModel(model);
  curKeypoint.set({
    author: get(author),
    src: get(vidSrc),
    id: '',
    start: null,
    end: null,
    tags: [],
    comments: null,
  });
  plots.setModel(model);
  curplot.setModel(model);
}

export function destroyModelStores(): void {
  gps.set('');
  vidSrc.set('');
  peaksSrc.set('');
  transcriptSrc.set('');
  transcriptLang.set('');
  mapStyle.set('');
  duration.set('');
  views.set([]);
  author.set('');
  keypoints.set([]);
  review.set([]);
  tags.set([]);
  cueData.set([]);
  plots.set('');
  curplot.set([]);
}
export const curKeypoint = createKeypoint();
