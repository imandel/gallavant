// https://github.com/katspaugh/wavesurfer.js/blob/master/src/util/get-id.js
export function getId(prefix: string): string {
  if (prefix === undefined) {
    prefix = '_';
  }
  return prefix + Math.random().toString(32).substring(2);
}

export interface keyConfig {
  [index: string]: (e: KeyboardEvent) => boolean;
}

export function processKey(e: KeyboardEvent, config: keyConfig): void {
  let shortcut = '';
  if (e.ctrlKey) {
    shortcut += 'ctrl+';
  }
  if (e.altKey) {
    shortcut += 'alt+';
  }
  if (e.shiftKey) {
    shortcut += 'shift+';
  }
  shortcut += e.code;
  console.log(shortcut);
  if (config[shortcut]?.(e)) {
    return;
  } else {
    config['quicktag'](e);
  }
}
