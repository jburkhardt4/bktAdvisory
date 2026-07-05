import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

// The real BookingModal loads the Cal.com iframe (@calcom/embed-react), which
// can't resolve in jsdom. Mock it and surface `calLink` so we can assert the
// correct Cal.com event slug is wired to each card.
vi.mock('../components/BookingModal', () => ({
  BookingModal: ({
    open,
    calLink,
    title,
  }: {
    open: boolean;
    calLink: string;
    title: string;
  }) =>
    open ? (
      <div data-testid="booking-modal" data-cal-link={calLink}>
        {title}
      </div>
    ) : null,
}));

import { BookingPage } from '../components/BookingPage';
import { router } from '../routes';

describe('BookingPage (/calendar)', () => {
  it('renders the three consulting meeting types under a meeting heading', () => {
    render(<BookingPage />);

    expect(
      screen.getByRole('heading', { name: 'Schedule a Meeting' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Discovery Call' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Strategic Planning' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workshop' })).toBeInTheDocument();

    // Durations render — including the explicit "1 hr" requested for Workshop.
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('1 hr')).toBeInTheDocument();

    // Legacy interview/phone content is gone.
    expect(screen.queryByText(/Schedule an Interview/i)).toBeNull();
    expect(screen.queryByText('Intro Call')).toBeNull();
    expect(screen.queryByText('Phone')).toBeNull();
  });

  it.each([
    ['Discovery Call', 'john-burkhardt/discovery-call'],
    ['Strategic Planning', 'john-burkhardt/strategic-planning'],
    ['Workshop', 'john-burkhardt/workshop'],
  ])(
    'opens the Cal.com modal for %s with event slug %s',
    async (name, expectedCalLink) => {
      render(<BookingPage />);

      fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));

      const modal = await screen.findByTestId('booking-modal');
      expect(modal).toHaveAttribute('data-cal-link', expectedCalLink);
    },
  );
});

describe('legacy /schedule redirect', () => {
  it('redirects /schedule to /calendar using the real route config', async () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/schedule'],
    });
    render(<RouterProvider router={testRouter} />);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Schedule a Meeting' }),
      ).toBeInTheDocument(),
    );
    expect(testRouter.state.location.pathname).toBe('/calendar');
  });
});
