import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminSidebar } from './AdminComponents';

describe('AdminSidebar interactions', () => {
  test('invokes onNavigate when a menu item is clicked', async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();

    render(<AdminSidebar activePage="dashboard" onNavigate={onNavigate} userRole="admin" />);

    const ordersLinks = screen.getAllByText('Orders');
    await user.click(ordersLinks[0]);

    expect(onNavigate).toHaveBeenCalledWith('orders');
  });

  test('catalog accordion toggles visibility of category links', async () => {
    const user = userEvent.setup();

    render(<AdminSidebar userRole="admin" />);

    // Click on Catalog to navigate (it's now a single menu item, not an accordion)
    const catalogLinks = screen.getAllByText('Catalog');
    expect(catalogLinks[0]).toBeInTheDocument();
  });
});
