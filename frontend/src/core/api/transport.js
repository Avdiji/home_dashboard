// WS transport singleton. Pure transport: connects to the backend /ws endpoint,
// sends outbound command messages, and fans inbound event messages out to
// subscribers. It imports NO stores (the apply_event layer does that), so there
// is no import cycle — stores import sendCommand, transport imports nothing
// from the app.
//
// Commands are queued until the socket is OPEN, so a mutation fired before the
// connection finishes opening (or during a reconnect) is not lost. Events are
// delivered to every registered subscriber (the realtime init registers the
// apply_event reducer). Reconnects with capped exponential backoff so a dropped
// connection self-heals.

import { WS_URL } from "../constants";

let ws = null;
let connected = false;
let everConnected = false; // distinguishes a reconnect from the first open
let reconnectTimer = null;
const queue = []; // outbound commands waiting for OPEN
const subscribers = new Set();
const openSubscribers = new Set();
let backoff = 1000;
const BACKOFF_MAX = 15000;

// Notify every subscriber with a parsed inbound message.
const dispatch = (raw) => {
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch (e) {
    console.error("ws: bad message JSON", e);
    return;
  }
  for (const cb of subscribers) {
    try {
      cb(msg);
    } catch (e) {
      console.error("ws: event subscriber threw", e);
    }
  }
};

const flush = () => {
  while (queue.length) {
    const cmd = queue.shift();
    sendRaw(cmd);
  }
};

const sendRaw = (cmd) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(cmd));
  } else {
    queue.push(cmd); // re-queue if connection dropped mid-send
  }
};

const open = () => {
  const sock = new WebSocket(WS_URL);
  ws = sock;

  sock.onopen = () => {
    connected = true;
    backoff = 1000;
    const reconnected = everConnected;
    everConnected = true;
    flush();
    for (const cb of openSubscribers) {
      try {
        cb(reconnected);
      } catch (e) {
        console.error("ws: open subscriber threw", e);
      }
    }
  };

  sock.onmessage = (e) => dispatch(e.data);

  sock.onclose = () => {
    if (ws !== sock) return; // a newer socket already replaced this one
    connected = false;
    ws = null;
    scheduleReconnect();
  };

  sock.onerror = (e) => {
    console.error("ws: socket error", e);
    // close handler will reconnect
  };
};

const scheduleReconnect = () => {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (!ws) open();
  }, backoff);
  backoff = Math.min(backoff * 2, BACKOFF_MAX);
};

// connectWS opens the websocket. Idempotent — safe to call more than once.
export function connectWS() {
  if (ws || connected) return;
  open();
}

// reconnectNow skips any pending backoff and reconnects immediately if the
// socket is down (e.g. the tab/app just came back to the foreground). No-op
// while a socket is open or opening.
export function reconnectNow() {
  if (ws) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  backoff = 1000;
  open();
}

// onOpen registers a callback fired on every successful open with
// `reconnected` (false on the first open). Events broadcast while the socket
// was down are lost, so subscribers use this to resync. Returns an unsubscribe.
export function onOpen(cb) {
  openSubscribers.add(cb);
  return () => openSubscribers.delete(cb);
}

// sendCommand enqueues a command for the server. `action` names the noop
// (e.g. "event.add"); `payload` is the per-action body. An optional `requestId`
// correlates the eventual error reply.
let reqSeq = 0;
export function sendCommand(action, payload, requestId) {
  const cmd = {
    action,
    requestId: requestId ?? `c${Date.now()}-${reqSeq++}`,
    payload,
  };
  sendRaw(cmd);
}

// onEvent registers a subscriber for parsed inbound messages. Returns an
// unsubscribe function.
export function onEvent(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}