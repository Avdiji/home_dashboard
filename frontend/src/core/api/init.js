// Realtime init — the one call wired from App.jsx on mount. Connects the
// websocket, registers applyEvent as the inbound reducer, and hydrates the
// stores from REST. After this, every store noop fires sendCommand and every
// broadcast event folds back into state — across every client.

import { connectWS, onEvent, onOpen, reconnectNow } from "./transport";
import { applyEvent } from "./apply_event";
import { loadAll } from "./load";

let started = false;

// Coming back to the foreground / network: the socket may have dropped (or
// missed broadcasts while the tab/app was suspended), so reconnect without
// waiting out the backoff and re-hydrate from REST.
const resync = () => {
  reconnectNow();
  loadAll();
};

// initRealtime boots the realtime layer. Idempotent — only the first call wins,
// so a React 18/19 StrictMode double-invoke (mount, unmount, remount) does not
// open a second socket or double-subscribe.
export function initRealtime() {
  if (started) return;
  started = true;
  connectWS();
  onEvent(applyEvent);
  // Broadcasts sent while the socket was down are gone — refetch on reconnect.
  onOpen((reconnected) => {
    if (reconnected) loadAll();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resync();
  });
  window.addEventListener("online", resync);
  loadAll();
}