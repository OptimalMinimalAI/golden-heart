
import { render, screen } from './test-utils'; // Adjusted import
import { describe, it, expect } from 'vitest';
import Header from '../components/dashboard/Header';

describe('Header component', () => {
  it('should render the header with the correct title', () => {
    render(<Header />);
    const headingElement = screen.getByRole('heading', { name: /GOLDEN HEART HUB/i });
    expect(headingElement).toBeInTheDocument();
  });
});
