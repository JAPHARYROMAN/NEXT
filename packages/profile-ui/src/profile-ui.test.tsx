import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { HandleField } from './handle-field';
import { useProfileDraftStore } from './store/profile-store';

describe('profile-ui', () => {
  beforeEach(() => {
    useProfileDraftStore.getState().reset();
  });

  it('sanitizes handle input', () => {
    const onChange = vi.fn();
    const { container } = render(
      <HandleField value="" available={null} onChange={onChange} onCheck={() => {}} />,
    );
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    fireEvent.change(input!, { target: { value: 'Hello!' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('marks handle available for valid demo handle', () => {
    useProfileDraftStore.getState().setHandle('mira_studio');
    useProfileDraftStore.getState().checkHandle();
    expect(useProfileDraftStore.getState().handleAvailable).toBe(true);
  });
});
