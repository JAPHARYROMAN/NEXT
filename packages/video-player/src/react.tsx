'use client';

// The React video player. Wraps a <video> element, drives the headless
// player-controls state machine, and surfaces QoE to the host via onQoE.

import { useCallback, useEffect, useRef, useState } from 'react';
import { apply, newSession, type Session } from '@next/player-controls';

export interface VideoPlayerProps {
  /** HLS/DASH manifest URL (signed, per ADR 0027). */
  readonly src: string;
  readonly poster?: string;
  readonly autoPlay?: boolean;
  /** Called whenever the QoE counters change — host streams these to analytics. */
  readonly onQoE?: (session: Session) => void;
}

/**
 * VideoPlayer renders a native <video> and tracks playback state. ABR + manifest
 * parsing are delegated to the browser (native HLS) or a media-source extension
 * the host injects; this component owns the state machine + QoE, not the codec.
 */
export function VideoPlayer({ src, poster, autoPlay, onQoE }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [session, setSession] = useState<Session>(newSession);

  const dispatch = useCallback(
    (event: Parameters<typeof apply>[1]) => {
      setSession((prev) => {
        const next = apply(prev, event);
        onQoE?.(next);
        return next;
      });
    },
    [onQoE],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const onWaiting = () => dispatch({ type: 'stall' });
    const onPlaying = () => dispatch({ type: 'resume' });
    const onPlay = () => dispatch({ type: 'play' });
    const onPause = () => dispatch({ type: 'pause' });
    const onEnded = () => dispatch({ type: 'end' });
    const onError = () => dispatch({ type: 'fail', reason: 'media element error' });
    const onLoaded = () => dispatch({ type: 'loaded' });

    el.addEventListener('waiting', onWaiting);
    el.addEventListener('playing', onPlaying);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    el.addEventListener('loadeddata', onLoaded);

    dispatch({ type: 'load' });

    return () => {
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
      el.removeEventListener('loadeddata', onLoaded);
    };
  }, [dispatch, src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay={autoPlay}
      controls
      playsInline
      data-player-state={session.state}
      style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
    />
  );
}
