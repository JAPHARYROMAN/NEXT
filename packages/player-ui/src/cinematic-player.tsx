'use client';

import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fullscreenVariants,
  motionSafe,
  overlayVariants,
  useReducedMotion,
} from '@next/animation-system';
import { usePlayerStore, trackPlaybackQoe, type MediaKind } from '@next/frontend-utils';
import { TheaterShell, TimelineScrubber, AmbientOverlay } from '@next/media-ui';
import { PlayerControls } from './player-controls';
import { GestureLayer } from './gesture-layer';
import { SubtitlesShell } from './subtitles-shell';
import { MiniPlayer } from './mini-player';

export interface CinematicPlayerProps {
  readonly mediaId: string;
  readonly title: string;
  readonly kind?: MediaKind;
  readonly durationSec?: number;
  readonly subtitleLine?: string;
  readonly className?: string;
}

export function CinematicPlayer({
  mediaId,
  title,
  kind = 'long',
  durationSec = 600,
  subtitleLine = 'Placeholder captions — connect caption pipeline when available.',
  className,
}: CinematicPlayerProps) {
  const reduced = useReducedMotion();
  const mode = usePlayerStore((s) => s.mode);
  const fullscreen = usePlayerStore((s) => s.fullscreen);
  const controlsVisible = usePlayerStore((s) => s.controlsVisible);
  const subtitlesOn = usePlayerStore((s) => s.subtitlesOn);
  const playing = usePlayerStore((s) => s.playing);
  const setMode = usePlayerStore((s) => s.setMode);
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const setControlsVisible = usePlayerStore((s) => s.setControlsVisible);
  const togglePlaying = usePlayerStore((s) => s.togglePlaying);
  const toggleSubtitles = usePlayerStore((s) => s.toggleSubtitles);

  const [hideTimer, setHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer) clearTimeout(hideTimer);
    const t = setTimeout(() => setControlsVisible(false), 4000);
    setHideTimer(t);
  }, [hideTimer, setControlsVisible]);

  useEffect(() => {
    trackPlaybackQoe('startup', Math.round(performance.now()));
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [hideTimer, mediaId]);

  if (mode === 'mini') {
    return (
      <MiniPlayer
        title={title}
        onExpand={() => setMode('theater')}
        {...(className ? { className } : {})}
      />
    );
  }

  const shellMode = fullscreen ? 'fullscreen' : mode === 'theater' ? 'theater' : 'default';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={shellMode}
        className={clsx('relative', fullscreen && 'fixed inset-0 z-[60]', className)}
        variants={motionSafe(fullscreenVariants, reduced)}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <TheaterShell title={title} mode={shellMode}>
          <div className="relative aspect-video w-full bg-black">
            <AmbientOverlay
              hue={kind === 'live' ? 16 : 220}
              intensity={kind === 'short' ? 0.35 : 0.25}
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-900/80 via-black to-black"
              aria-hidden
            >
              <span className="text-sm text-white/40">
                Preview — {kind} · {mediaId}
              </span>
            </div>
            <GestureLayer onTap={bumpControls} onDoubleTap={togglePlaying} />
            <SubtitlesShell visible={subtitlesOn} line={subtitleLine} />
            <PlayerControls
              title={title}
              kind={kind}
              playing={playing}
              controlsVisible={controlsVisible}
              onPlayPause={togglePlaying}
              onTheater={() => setMode('theater')}
              onFullscreen={() => setFullscreen(!fullscreen)}
              onSubtitles={toggleSubtitles}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 px-4 pb-20 pt-2"
              variants={motionSafe(overlayVariants, reduced)}
              initial="initial"
              animate="animate"
            >
              <TimelineScrubber durationSec={durationSec} label="Playback" />
            </motion.div>
          </div>
        </TheaterShell>
      </motion.div>
    </AnimatePresence>
  );
}
