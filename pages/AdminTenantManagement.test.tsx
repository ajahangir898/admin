import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AdminTenantManagement from './AdminTenantManagement';
import type { Tenant } from '../types';

const makeTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
  id: 'tenant-1',
  name: 'Alpha Gadgets',
  subdomain: 'alpha-gadgets',
  contactEmail: 'alpha@example.com',
  contactName: 'Alpha',
  plan: 'starter',
  status: 'active',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  onboardingCompleted: true,
  locale: 'en-US',
  currency: 'BTD',
  branding: {},
  settings: {},
  ...overrides,
});

describe('AdminTenantManagement', () => {
  test('auto-derives subdomain from store name', async () => {
    const user = userEvent.setup();
    render(
      <AdminTenantManagement
        tenants={[]}
        onCreateTenant={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText(/acme outdoors/i), 'Acme Labs');

    expect(screen.getByPlaceholderText(/acme-shop/i)).toHaveValue('acme-labs');
  });

  test('disables submission when subdomain conflicts', async () => {
    const user = userEvent.setup();
    const tenants = [makeTenant({ subdomain: 'acme-shop' })];
    render(
      <AdminTenantManagement
        tenants={tenants}
        onCreateTenant={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText(/acme outdoors/i), 'Acme Shop');
    await user.type(screen.getByPlaceholderText(/ops@acme.com/i), 'ops@acme.com');
    await user.type(screen.getByPlaceholderText(/admin@acme.com/i), 'admin@acme.com');
    await user.type(screen.getByPlaceholderText(/temppass123/i), 'secret12');
    await user.type(screen.getByPlaceholderText(/repeat password/i), 'secret12');

    expect(screen.getByRole('button', { name: /launch tenant/i })).toBeDisabled();
  });

  test('submits payload via onCreateTenant', async () => {
    const user = userEvent.setup();
    const onCreateTenant = vi.fn().mockResolvedValue(makeTenant({ id: 'tenant-2', subdomain: 'beta-shop', name: 'Beta' }));

    render(
      <AdminTenantManagement
        tenants={[]}
        onCreateTenant={onCreateTenant}
      />
    );

    await user.type(screen.getByPlaceholderText(/acme outdoors/i), 'Beta Shop');
    await user.type(screen.getByPlaceholderText(/ops@acme.com/i), 'beta@example.com');
    await user.type(screen.getByPlaceholderText(/sadia islam/i), 'Bianca');
    await user.type(screen.getByPlaceholderText(/admin@acme.com/i), 'owner@beta.com');
    await user.type(screen.getByPlaceholderText(/temppass123/i), 'BetaSecret1');
    await user.type(screen.getByPlaceholderText(/repeat password/i), 'BetaSecret1');

    await user.click(screen.getByRole('button', { name: /launch tenant/i }));

    expect(onCreateTenant).toHaveBeenCalledTimes(1);
    expect(onCreateTenant.mock.calls[0][0]).toMatchObject({
      name: 'Beta Shop',
      subdomain: 'beta-shop',
      contactEmail: 'beta@example.com',
      adminEmail: 'owner@beta.com',
      adminPassword: 'BetaSecret1'
    });
    expect(onCreateTenant.mock.calls[0][1]).toEqual({ activate: true });
  });

  test('delete flow triggers onDeleteTenant', async () => {
    const user = userEvent.setup();
    const tenants = [makeTenant()];
    const onDeleteTenant = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminTenantManagement
        tenants={tenants}
        onCreateTenant={vi.fn()}
        onDeleteTenant={onDeleteTenant}
      />
    );

    await user.click(screen.getByRole('button', { name: /remove/i }));
    await user.click(screen.getByRole('button', { name: /delete tenant/i }));

    expect(onDeleteTenant).toHaveBeenCalledWith('tenant-1');
  });
});
