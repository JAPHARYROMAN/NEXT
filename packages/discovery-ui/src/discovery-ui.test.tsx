import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SemanticExplorer } from './semantic-explorer';

describe('discovery-ui', () => {
  it('renders semantic topics', () => {
    render(<SemanticExplorer topics={[{ id: '1', label: 'Ambient sound', relation: 'near' }]} />);
    expect(screen.getByLabelText('Semantic exploration')).toBeTruthy();
    expect(screen.getByText('Ambient sound')).toBeTruthy();
  });
});
