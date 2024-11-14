import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders whiteboard component', () => {
    render(<App />);
    expect(document.querySelector('.whiteboard')).toBeInTheDocument();
  });

  test('renders toolbar with title', () => {
    render(<App />);
    expect(screen.getByText('Beautiful Whiteboard')).toBeInTheDocument();
  });

  test('renders add box button', () => {
    render(<App />);
    expect(screen.getByText('Add Box')).toBeInTheDocument();
  });
});
