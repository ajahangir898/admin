import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CommunicationTab from './CommunicationTab';

// Mock fetch
global.fetch = vi.fn();

describe('CommunicationTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  test('renders the Communication & CRM title', () => {
    render(<CommunicationTab />);
    expect(screen.getByText('Communication & CRM')).toBeInTheDocument();
  });

  test('renders all three sub-tabs', () => {
    render(<CommunicationTab />);
    expect(screen.getByText(/Bulk Announcements/i)).toBeInTheDocument();
    expect(screen.getByText(/At-Risk Merchants/i)).toBeInTheDocument();
    // Use getAllByText since "Support Tickets" appears in the description too
    const supportTicketsElements = screen.getAllByText(/Support Tickets/i);
    expect(supportTicketsElements.length).toBeGreaterThan(0);
  });

  test('shows announcements tab by default', () => {
    render(<CommunicationTab />);
    expect(screen.getByText('Announcements')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Announcement/i })).toBeInTheDocument();
  });

  test('shows empty state when no announcements', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    });

    render(<CommunicationTab />);
    
    // Wait for the empty state to appear
    const emptyMessage = await screen.findByText(/No announcements yet/i);
    expect(emptyMessage).toBeInTheDocument();
  });
});
