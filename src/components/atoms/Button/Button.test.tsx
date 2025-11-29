import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button />);
  });

  it('renders with required props', () => {
    render(<Button
      label={"test label"}
    />);
  });

});
