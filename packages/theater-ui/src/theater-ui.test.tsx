import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChapterNav } from './chapter-nav';
import { TheaterShell } from './theater-shell';

describe('theater-ui', () => {
  it('renders chapter nav with a11y label', () => {
    render(
      <TheaterShell>
        <ChapterNav chapters={[{ id: '1', label: 'Opening', startSec: 0 }]} />
      </TheaterShell>,
    );
    expect(screen.getByLabelText('Chapter navigation')).toBeTruthy();
    expect(screen.getByText('Opening')).toBeTruthy();
  });
});
