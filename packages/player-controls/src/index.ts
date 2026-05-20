// Headless playback state machine. The video element (DOM, RN, TV) is a
// concern of the host; this owns the *logic* — state, transitions, QoE counters.

import type { Rung } from '@next/streaming-utils';

export type PlayerState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

export type PlayerEvent =
  | { type: 'load' }
  | { type: 'loaded' }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'stall' }
  | { type: 'resume' }
  | { type: 'end' }
  | { type: 'fail'; reason: string };

/** Pure transition function. Invalid events are no-ops (return current state). */
export function transition(state: PlayerState, event: PlayerEvent): PlayerState {
  switch (state) {
    case 'idle':
      return event.type === 'load' ? 'loading' : state;
    case 'loading':
      if (event.type === 'loaded') return 'playing';
      if (event.type === 'fail') return 'error';
      return state;
    case 'playing':
      if (event.type === 'pause') return 'paused';
      if (event.type === 'stall') return 'buffering';
      if (event.type === 'end') return 'ended';
      if (event.type === 'fail') return 'error';
      return state;
    case 'paused':
      if (event.type === 'play') return 'playing';
      if (event.type === 'fail') return 'error';
      return state;
    case 'buffering':
      if (event.type === 'resume') return 'playing';
      if (event.type === 'fail') return 'error';
      return state;
    case 'ended':
      return event.type === 'load' ? 'loading' : state;
    case 'error':
      return event.type === 'load' ? 'loading' : state;
    default:
      return state;
  }
}

/** Live QoE counters accumulated over a play session. */
export interface QoE {
  watchedMs: number;
  stalledMs: number;
  stallCount: number;
  startupMs: number;
  rungSwitches: number;
}

export function newQoE(): QoE {
  return { watchedMs: 0, stalledMs: 0, stallCount: 0, startupMs: 0, rungSwitches: 0 };
}

export interface Session {
  state: PlayerState;
  qoe: QoE;
  currentRung: Rung | null;
}

export function newSession(): Session {
  return { state: 'idle', qoe: newQoE(), currentRung: null };
}

/** Apply an event to a session, updating state + QoE counters. */
export function apply(session: Session, event: PlayerEvent): Session {
  const next: Session = {
    state: transition(session.state, event),
    qoe: { ...session.qoe },
    currentRung: session.currentRung,
  };
  if (event.type === 'stall') {
    next.qoe.stallCount += 1;
  }
  return next;
}

/** Record a rung change for the switch counter. */
export function switchRung(session: Session, rung: Rung): Session {
  return {
    ...session,
    currentRung: rung,
    qoe: { ...session.qoe, rungSwitches: session.qoe.rungSwitches + 1 },
  };
}
