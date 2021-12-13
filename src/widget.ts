// Copyright (c) ilan
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';
import { setStoreModels, destroyModelStores } from './stores';

import { MODULE_NAME, MODULE_VERSION } from './version';

import Widget from './Widget.svelte';

export class MapView extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: MapView.model_name,
      _model_module: MapView.model_module,
      _model_module_version: MapView.model_module_version,
      _view_name: MapView.view_name,
      _view_module: MapView.view_module,
      _view_module_version: MapView.view_module_version,
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'MapView';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ViewMap'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class ExampleModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ExampleModel.model_name,
      _model_module: ExampleModel.model_module,
      _model_module_version: ExampleModel.model_module_version,
      _view_name: ExampleModel.view_name,
      _view_module: ExampleModel.view_module,
      _view_module_version: ExampleModel.view_module_version,
      value: 'Hello World',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'ExampleModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ExampleView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class ExampleView extends DOMWidgetView {
  render() {
    setStoreModels(this.model);
    new Widget({ target: this.el });
  }
}

export class ViewMap extends DOMWidgetView {
  render() {
    setStoreModels(this.model);
    new Widget({
      target: this.el,
      props: {
        model: this.model,
      },
    });
  }
  remove() {
    console.log('remove');
    destroyModelStores();
  }
}
