// https://github.com/katspaugh/wavesurfer.js/blob/master/src/util/get-id.js
export function getId(prefix: string): string {
    if (prefix === undefined) {
      prefix = '_';
    }
    return prefix + Math.random().toString(32).substring(2);
  }

// export function processKey(e: KeyboardEvent): {string, KeyboardEvent} {
//   let shortcut: string = '';
// if (e.ctrlKey) {
//     shortcut += 'ctrl+';
// }
// if (e.altKey) {
//     shortcut += 'alt+';
// }
// if (e.shiftKey) {
//     shortcut += 'shift+';
// }

// e.shortcut = shortcut
// return shortcut += e.code
// }