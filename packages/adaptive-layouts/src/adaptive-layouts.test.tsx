import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImmersiveViewport } from './immersive-viewport';

describe('adaptive-layouts', () => {
  it('renders immersive viewport', () => {
    render(
      <ImmersiveViewport overlay={<span>Controls</span>}>
        <div>Media</div>
      </ImmersiveViewport>,
    );
    expect(screen.getByLabelText('Immersive media viewport')).toBeTruthy();
    expect(screen.getByText('Controls')).toBeTruthy();
  });
});
