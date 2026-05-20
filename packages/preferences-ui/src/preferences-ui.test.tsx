import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { DiscoveryModePicker } from './discovery-mode-picker';
import { usePreferencesStore } from './store/preferences-store';

describe('preferences-ui', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset();
  });

  it('updates discovery randomness', () => {
    const onChange = vi.fn();
    render(<DiscoveryModePicker randomness={40} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '55' } });
    expect(onChange).toHaveBeenCalledWith(55);
  });

  it('resets recommendations to defaults', () => {
    usePreferencesStore.getState().setFeedPersonalization(90);
    usePreferencesStore.getState().resetRecommendations();
    expect(usePreferencesStore.getState().feedPersonalization).toBe(50);
  });
});
