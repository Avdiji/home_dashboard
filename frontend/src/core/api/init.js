// Realtime init — the one call wired from App.jsx on mount. Connects the
// websocket, registers applyEvent as the inbound reducer, and hydrates the
// stores from REST. After this, every store noop fires sendCommand and every
// broadcast event folds back into state — across every client.

import { connectWS, onEvent } from "./transport";
import { applyEvent } from "./apply_event";
import { loadAll } from "./load";

let started = false;

// initRealtime boots the realtime layer. Idempotent — only the first call wins,
// so a React 18/19 StrictMode double-invoke (mount, unmount, remount) does not
// open a second socket or double-subscribe.
export function initRealtime() {
  if (started) return;
  started = true;
  connectWS();
  onEvent(applyEvent);
  loadAll();
}