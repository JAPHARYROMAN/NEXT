import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UploadZone } from './upload-zone';

describe('studio-components', () => {
  it('renders upload zone', () => {
    render(<UploadZone />);
    expect(screen.getByText('Drop your work here')).toBeTruthy();
  });
});
