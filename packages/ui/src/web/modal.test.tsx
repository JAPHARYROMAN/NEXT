import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './modal';

describe('Modal', () => {
  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Test" onClose={onClose}>
        Body
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('exposes dialog with title', () => {
    render(
      <Modal open title="Settings" onClose={() => {}}>
        Body
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeTruthy();
  });
});
