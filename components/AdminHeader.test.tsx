import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminHeader } from './AdminComponents';
import type { Tenant } from '../types';

const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Alpha Gadgets',
    plan: 'growth',
    status: 'active',
    subdomain: 'alpha.example.com',
    contactEmail: 'owner@alpha.com',
    contactName: 'Alex Alpha',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    onboardingCompleted: true,
  },
  {
    id: 'tenant-2',
    name: 'Beta Store',
    plan: 'enterprise',
    status: 'trialing',
    subdomain: 'beta.example.com',
    contactEmail: 'hello@beta.com',
    contactName: 'Bianca Beta',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-02T00:00:00.000Z',
    onboardingCompleted: true,
  }
];

const baseProps = {
  onSwitchView: () => void 0,
  onLogout: () => void 0,
  onMenuClick: () => void 0,
};

describe('AdminHeader tenant selector', () => {
  test('renders plan and status metadata for the active tenant', () => {
    render(
      <AdminHeader
        {...baseProps}
        tenants={mockTenants}
        activeTenantId={mockTenants[0].id}
        onTenantChange={() => {}}
      />
    );

    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('shows spinner while a tenant change is in progress', () => {
    const { container } = render(
      <AdminHeader
        {...baseProps}
        tenants={mockTenants}
        activeTenantId={mockTenants[0].id}
        onTenantChange={() => {}}
        isTenantSwitching
      />
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('invokes onTenantChange when a different tenant is selected', async () => {
    const onTenantChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AdminHeader
        {...baseProps}
        tenants={mockTenants}
        activeTenantId={mockTenants[0].id}
        onTenantChange={onTenantChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /tenant/i }));
    await user.click(screen.getByRole('button', { name: /beta store/i }));

    expect(onTenantChange).toHaveBeenCalledTimes(1);
    expect(onTenantChange).toHaveBeenCalledWith('tenant-2');
  });

  test('mobile select path triggers tenant change callback', async () => {
    const onTenantChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AdminHeader
        {...baseProps}
        tenants={mockTenants}
        activeTenantId={mockTenants[0].id}
        onTenantChange={onTenantChange}
      />
    );

    const select = screen.getByLabelText(/tenant/i) as HTMLSelectElement;
    await user.selectOptions(select, 'tenant-2');

    expect(onTenantChange).toHaveBeenCalledWith('tenant-2');
  });
});
