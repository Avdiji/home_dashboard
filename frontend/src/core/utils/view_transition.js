// Smooth spawn/vanish for any state change: wraps a synchronous mutation in a
// same-document View Transition so the browser crossfades the DOM before/after
// snapshots instead of swapping instantly. React state updates are flushed
// synchronously (flushSync) so the "after" snapshot reflects the new DOM.
//
// Falls back to running the mutation directly when the View Transitions API is
// unavailable (older browsers). Used by the websocket apply reducer (entity
// spawn/vanish) and the modal/form open-close sites.
import { flushSync } from "react-dom";

export function transition(fn) {
  if (typeof document !== "undefined" && document.startViewTransition) {
    document.startViewTransition(() => flushSync(fn));
  } else {
    fn();
  }
}