/**
 * True for a plain left click on a link: no modifier key, main button. That
 * is the only click a quick view should take over. Cmd/Ctrl-click,
 * Shift-click and the middle button are the browser's "open in a new tab or
 * window" and must reach it untouched.
 */
export function isPlainClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
