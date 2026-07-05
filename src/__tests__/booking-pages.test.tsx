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

import {
  InterviewBookingPage,
  ConsultingBookingPage,
} from '../components/BookingPage';
import { router } from '../routes';

describe('InterviewBookingPage (/calendar)', () => {
  it('renders the three personal interview types under an interview heading', () => {
    render(<InterviewBookingPage />);

    expect(
      screen.getByRole('heading', { name: 'Schedule an Interview' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Intro Call' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '30-Minute Interview' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '1-Hour Interview' }),
    ).toBeInTheDocument();

    // Consulting content must NOT be on this page.
    expect(screen.queryByText('Discovery Call')).toBeNull();
    expect(screen.queryByText('Workshop')).toBeNull();
  });

  it.each([
    ['Intro Call', 'john-burkhardt/intro-call'],
    ['30-Minute Interview', 'john-burkhardt/30-minute-interview'],
    ['1-Hour Interview', 'john-burkhardt/1-hour-interview'],
  ])('opens the Cal.com modal for %s with event slug %s', async (name, calLink) => {
    render(<InterviewBookingPage />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));

    const modal = await screen.findByTestId('booking-modal');
    expect(modal).toHaveAttribute('data-cal-link', calLink);
  });
});

describe('ConsultingBookingPage (/schedule)', () => {
  it('renders the three consulting meeting types under a meeting heading', () => {
    render(<ConsultingBookingPage />);

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

    // Explicit "1 hr" requested for Workshop.
    expect(screen.getByText('1 hr')).toBeInTheDocument();

    // Interview content must NOT be on this page.
    expect(screen.queryByText('Intro Call')).toBeNull();
    expect(screen.queryByText('30-Minute Interview')).toBeNull();
  });

  it.each([
    ['Discovery Call', 'john-burkhardt/discovery-call'],
    ['Strategic Planning', 'john-burkhardt/strategic-planning'],
    ['Workshop', 'john-burkhardt/workshop'],
  ])('opens the Cal.com modal for %s with event slug %s', async (name, calLink) => {
    render(<ConsultingBookingPage />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));

    const modal = await screen.findByTestId('booking-modal');
    expect(modal).toHaveAttribute('data-cal-link', calLink);
  });
});

describe('booking routes (both live, no redirect)', () => {
  it('serves the interview page at /calendar', async () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/calendar'],
    });
    render(<RouterProvider router={testRouter} />);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Schedule an Interview' }),
      ).toBeInTheDocument(),
    );
    expect(testRouter.state.location.pathname).toBe('/calendar');
  });

  it('serves the consulting page at /schedule without redirecting', async () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/schedule'],
    });
    render(<RouterProvider router={testRouter} />);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Schedule a Meeting' }),
      ).toBeInTheDocument(),
    );
    // /schedule stays put — it is no longer redirected to /calendar.
    expect(testRouter.state.location.pathname).toBe('/schedule');
  });
});
