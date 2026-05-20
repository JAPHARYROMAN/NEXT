import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TimelineScrubber } from './timeline-scrubber';
import { ChapterNav } from './chapter-nav';

describe('media-ui', () => {
  it('renders scrubber with aria label', () => {
    render(<TimelineScrubber durationSec={120} label="Playback" />);
    expect(screen.getByLabelText('Playback scrubber')).toBeTruthy();
  });

  it('renders chapter navigation', () => {
    render(<ChapterNav chapters={[{ id: 'a', label: 'Intro', startSec: 0 }]} activeId="a" />);
    expect(screen.getByLabelText('Chapters')).toBeTruthy();
  });
});
