// https://github.com/katspaugh/wavesurfer.js/blob/master/src/util/get-id.js
export function getId(prefix: string): string {
    if (prefix === undefined) {
      prefix = '_';
    }
    return prefix + Math.random().toString(32).substring(2);
  }

