import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock fetch
global.fetch = jest.fn();

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main heading', async () => {
    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, value: 'DB works' }),
      });

    const component = await Home();
    render(component);

    const heading = screen.getByRole('heading', { name: /it works/i });
    expect(heading).toBeInTheDocument();
  });

  it('displays backend health status', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, value: 'DB works' }),
      });

    const component = await Home();
    render(component);

    expect(screen.getByText('Backend health')).toBeInTheDocument();
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('displays DB check value', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, value: 'DB works' }),
      });

    const component = await Home();
    render(component);

    expect(screen.getByText('DB check')).toBeInTheDocument();
    expect(screen.getByText('DB works')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('DB error'));

    const component = await Home();
    render(component);

    expect(screen.getByText('Backend health')).toBeInTheDocument();
    expect(screen.getByText('unreachable')).toBeInTheDocument();
  });

  it('displays error when post fetch fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

    const component = await Home();
    render(component);

    expect(screen.getByText('DB check')).toBeInTheDocument();
    expect(screen.getByText('HTTP 404')).toBeInTheDocument();
  });
});
