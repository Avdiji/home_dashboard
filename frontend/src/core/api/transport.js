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
const queue = []; // outbound commands waiting for OPEN
const subscribers = new Set();
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
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    connected = true;
    backoff = 1000;
    flush();
  };

  ws.onmessage = (e) => dispatch(e.data);

  ws.onclose = () => {
    connected = false;
    ws = null;
    scheduleReconnect();
  };

  ws.onerror = (e) => {
    console.error("ws: socket error", e);
    // close handler will reconnect
  };
};

const scheduleReconnect = () => {
  setTimeout(() => {
    if (!connected) open();
  }, backoff);
  backoff = Math.min(backoff * 2, BACKOFF_MAX);
};

// connectWS opens the websocket. Idempotent — safe to call more than once.
export function connectWS() {
  if (ws || connected) return;
  open();
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