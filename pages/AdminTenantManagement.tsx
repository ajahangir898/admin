import React, { useMemo, useState } from 'react';
import { Building2, CheckCircle2, AlertCircle, Mail, User, Globe, Hash, Clock3, Shield, Sparkles, Trash2, Activity, Users as UsersIcon, PieChart, Lock, ExternalLink, Link2, WifiOff, Wifi, Loader2 as Spinner } from 'lucide-react';
import { CreateTenantPayload, Tenant } from '../types';
import { RESERVED_TENANT_SLUGS } from '../constants';

interface AdminTenantManagementProps {
  tenants: Tenant[];
  onCreateTenant: (payload: CreateTenantPayload, options?: { activate?: boolean }) => Promise<Tenant>;
  isCreating?: boolean;
  onDeleteTenant?: (tenantId: string) => Promise<void>;
  deletingTenantId?: string | null;
}

const PLAN_OPTIONS: CreateTenantPayload['plan'][] = ['starter', 'growth', 'enterprise'];

const prettify = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const sanitizeSubdomain = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

const AdminTenantManagement: React.FC<AdminTenantManagementProps> = ({ tenants, onCreateTenant, isCreating, onDeleteTenant, deletingTenantId }) => {
  type DomainStatus = 'idle' | 'checking' | 'online' | 'offline';
  const [form, setForm] = useState({
    name: '',
    contactEmail: '',
    contactName: '',
    subdomain: '',
    plan: PLAN_OPTIONS[0],
    adminEmail: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    autoActivate: true,
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Tenant | null>(null);
  const [domainStatuses, setDomainStatuses] = useState<Record<string, DomainStatus>>({});

  const normalizeDomain = (value?: string | null) => {
    if (!value) return '';
    return value
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
  };

  const primaryDomain = normalizeDomain(import.meta.env.VITE_PRIMARY_DOMAIN) || (typeof window !== 'undefined' ? window.location.hostname : '');
  const tenantProtocol = primaryDomain.includes('localhost') || primaryDomain.startsWith('127.') ? 'http' : 'https';
  const formatTenantDomain = (subdomain?: string | null) => {
    if (!subdomain) return null;
    const slug = subdomain.trim();
    if (!slug || !primaryDomain) return null;
    return `${tenantProtocol}://${slug}.${primaryDomain}`;
  };

  const sortedTenants = useMemo(
    () => [...tenants].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [tenants]
  );

  const domainStatusLabel = (value: DomainStatus | undefined) => {
    switch (value) {
      case 'online':
        return { label: 'Reachable', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'offline':
        return { label: 'Offline', className: 'bg-red-50 text-red-600 border-red-100' };
      case 'checking':
        return { label: 'Checking...', className: 'bg-amber-50 text-amber-700 border-amber-100' };
      default:
        return { label: 'Not checked', className: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  const handleCheckDomain = async (tenant: Tenant) => {
    if (!tenant?.subdomain) {
      setStatus({ type: 'error', message: 'This tenant does not have a subdomain yet.' });
      return;
    }
    if (!primaryDomain) {
      setStatus({ type: 'error', message: 'Set VITE_PRIMARY_DOMAIN to verify storefront URLs.' });
      return;
    }
    const targetUrl = formatTenantDomain(tenant.subdomain);
    if (!targetUrl) {
      setStatus({ type: 'error', message: 'Unable to build tenant URL. Check your domain settings.' });
      return;
    }
    setDomainStatuses(prev => ({ ...prev, [tenant.id]: 'checking' }));
    try {
      await fetch(`${targetUrl}?uptime=${Date.now()}`, { mode: 'no-cors', cache: 'no-store' });
      setDomainStatuses(prev => ({ ...prev, [tenant.id]: 'online' }));
    } catch (error) {
      console.warn('Subdomain reachability check failed', error);
      setDomainStatuses(prev => ({ ...prev, [tenant.id]: 'offline' }));
    }
  };

  const metrics = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter(tenant => tenant.status === 'active').length;
    const trialing = tenants.filter(tenant => tenant.status === 'trialing').length;
    const enterprise = tenants.filter(tenant => tenant.plan === 'enterprise').length;
    const latest = sortedTenants[0];
    return {
      total,
      active,
      trialing,
      enterprise,
      latestName: latest?.name || '—',
      latestDate: latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString() : 'No recent activity'
    };
  }, [sortedTenants, tenants]);

  const deletingId = deletingTenantId || null;

  const subdomainConflict = useMemo(() => {
    if (!form.subdomain) return false;
    return tenants.some(tenant => tenant.subdomain?.toLowerCase() === form.subdomain.toLowerCase());
  }, [form.subdomain, tenants]);

  const isReservedSubdomain = useMemo(() => {
    if (!form.subdomain) return false;
    return RESERVED_TENANT_SLUGS.includes(form.subdomain.toLowerCase());
  }, [form.subdomain]);

  const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email.trim());
  const contactEmailValid = form.contactEmail ? isEmailValid(form.contactEmail) : false;
  const adminEmailValid = form.adminEmail ? isEmailValid(form.adminEmail) : false;
  const adminPasswordValue = form.adminPassword.trim();
  const adminPasswordConfirmValue = form.adminPasswordConfirm.trim();
  const adminPasswordStrong = adminPasswordValue.length >= 6;
  const adminPasswordsMatch = adminPasswordConfirmValue.length > 0 && adminPasswordValue === adminPasswordConfirmValue;
  const passwordMismatch = adminPasswordConfirmValue.length > 0 && adminPasswordValue !== adminPasswordConfirmValue;
  const passwordTooShort = adminPasswordValue.length > 0 && !adminPasswordStrong;

  const handleInputChange = (field: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value: string) => {
    const sanitized = value.slice(0, 60);
    handleInputChange('name', sanitized);
    if (!subdomainTouched) {
      const derived = sanitizeSubdomain(sanitized.replace(/\s+/g, '-'));
      handleInputChange('subdomain', derived);
    }
  };

  const handleSubdomainChange = (value: string) => {
    setSubdomainTouched(true);
    handleInputChange('subdomain', sanitizeSubdomain(value));
  };

  const handleDeleteRequest = (tenant: Tenant) => {
    if (!onDeleteTenant) return;
    setPendingDelete(tenant);
    setStatus(null);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete || !onDeleteTenant) return;
    try {
      await onDeleteTenant(pendingDelete.id);
      setStatus({ type: 'success', message: `${pendingDelete.name} was removed.` });
      setPendingDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete tenant. Please try again.';
      setStatus({ type: 'error', message });
    }
  };

  const handleDeleteModalClose = () => {
    if (deletingId) return;
    setPendingDelete(null);
  };

  const canSubmit = Boolean(
    form.name &&
    form.subdomain &&
    form.contactEmail &&
    form.adminEmail &&
    contactEmailValid &&
    adminEmailValid &&
    adminPasswordStrong &&
    adminPasswordsMatch &&
    !subdomainConflict &&
    !isReservedSubdomain
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || isCreating) return;

    const payload: CreateTenantPayload = {
      name: form.name.trim(),
      contactEmail: form.contactEmail.trim(),
      contactName: form.contactName.trim() || undefined,
      subdomain: form.subdomain,
      plan: form.plan,
      adminEmail: form.adminEmail.trim(),
      adminPassword: form.adminPassword.trim(),
    };

    try {
      setStatus(null);
      await onCreateTenant(payload, { activate: form.autoActivate });
      setStatus({ type: 'success', message: `${form.name} was created successfully.` });
      setForm({
        name: '',
        contactEmail: '',
        contactName: '',
        subdomain: '',
        plan: PLAN_OPTIONS[0],
        adminEmail: '',
        adminPassword: '',
        adminPasswordConfirm: '',
        autoActivate: true
      });
      setSubdomainTouched(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create tenant. Please try again.';
      setStatus({ type: 'error', message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="rounded-3xl bg-gradient-to-r from-zinc-900 via-slate-900 to-emerald-900 text-white p-8 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-start gap-6">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <Building2 size={36} />
          </div>
          <div className="flex-1 space-y-3 min-w-[250px]">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Multi-tenant control</p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Create a new storefront</h1>
              <Sparkles size={20} className="text-emerald-300" />
            </div>
            <p className="text-white/70 max-w-2xl">Spin up demo stores or production tenants in seconds. Each tenant gets isolated catalog, orders, and theme settings.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80 min-w-[200px]">
            <p className="text-xs uppercase text-white/50">Active tenants</p>
            <p className="text-3xl font-black">{tenants.length}</p>
            <p className="text-emerald-200 mt-2">Connected to selection menu instantly</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total tenants"
          value={metrics.total}
          helper={`${metrics.active} active`}
          icon={<UsersIcon size={18} />}
          accentClass="bg-slate-900 text-white"
        />
        <MetricCard
          label="Trialing"
          value={metrics.trialing}
          helper="onboarding"
          icon={<Activity size={18} />}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Enterprise"
          value={metrics.enterprise}
          helper="high-touch"
          icon={<PieChart size={18} />}
          accentClass="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          label="Latest launch"
          value={metrics.latestName}
          helper={metrics.latestDate}
          icon={<Sparkles size={18} />}
          accentClass="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tenant details</h2>
              <p className="text-sm text-gray-500">Provide the basics—we will seed catalog templates automatically.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
              <Shield size={12} /> Environment safe
            </div>
          </div>

          {status && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Store name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  placeholder="Acme Outdoors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Primary email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => handleInputChange('contactEmail', event.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  placeholder="ops@acme.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact name (optional)</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(event) => handleInputChange('contactName', event.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  placeholder="Sadia Islam"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subdomain</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={form.subdomain}
                  onChange={(event) => handleSubdomainChange(event.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-sm ${(subdomainConflict || isReservedSubdomain) ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'}`}
                  placeholder="acme-shop"
                  required
                />
              </div>
              <p className={`text-xs ${(subdomainConflict || isReservedSubdomain) ? 'text-red-600' : 'text-gray-400'}`}>
                {subdomainConflict
                  ? 'Subdomain already in use.'
                  : isReservedSubdomain
                    ? 'This keyword is reserved. Pick a different slug.'
                    : 'Shown as subdomain.localhost:3000 or subdomain.systemnextit.com'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={form.plan}
                  onChange={(event) => handleInputChange('plan', event.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm appearance-none"
                >
                  {PLAN_OPTIONS.map(option => (
                    <option key={option} value={option}>{prettify(option)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Auto-switch after creation</label>
              <label className="flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-2xl cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.autoActivate}
                  onChange={(event) => handleInputChange('autoActivate', event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Switch dashboard to the new tenant once ready
              </label>
            </div>
            <div className="md:col-span-2 pt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Lock size={14} className="text-gray-400" /> Admin credentials
              </p>
              <p className="text-xs text-gray-500 mt-1">Each tenant gets a dedicated admin login.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin login email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={(event) => handleInputChange('adminEmail', event.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-sm ${form.adminEmail && !adminEmailValid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'}`}
                  placeholder="admin@acme.com"
                  required
                />
              </div>
              <p className={`text-xs ${form.adminEmail && !adminEmailValid ? 'text-red-600' : 'text-gray-400'}`}>
                Used when verifying dashboard access.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={form.adminPassword}
                  onChange={(event) => handleInputChange('adminPassword', event.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-sm ${passwordTooShort ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'}`}
                  placeholder="TempPass123"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <p className={`text-xs ${passwordTooShort ? 'text-red-600' : 'text-gray-400'}`}>
                Minimum 6 characters.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={form.adminPasswordConfirm}
                  onChange={(event) => handleInputChange('adminPasswordConfirm', event.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-sm ${passwordMismatch ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'}`}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
              <p className={`text-xs ${passwordMismatch ? 'text-red-600' : 'text-gray-400'}`}>
                Must match the admin password exactly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-800">Need demo data?</p>
              <p className="text-xs text-gray-500">Sample catalog, landing page, and order records will follow automatically.</p>
            </div>
            <button
              type="submit"
              disabled={!canSubmit || isCreating}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-lg ${(!canSubmit || isCreating) ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isCreating ? (
                <>
                  <LoaderDots />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Launch tenant
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Existing tenants</h3>
            <p className="text-sm text-gray-500">Newest first. Click a tenant from the header selector to jump in.</p>
          </div>
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {sortedTenants.slice(0, 8).map((tenant) => {
              const tenantUrl = formatTenantDomain(tenant.subdomain);
              const reachability = domainStatusLabel(domainStatuses[tenant.id]);
              const isChecking = domainStatuses[tenant.id] === 'checking';
              const domainLabel = tenant.subdomain ? (primaryDomain ? `${tenant.subdomain}.${primaryDomain}` : tenant.subdomain) : 'No subdomain';
              return (
                <div key={tenant.id} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{tenant.name}</p>
                      <p className="text-xs text-gray-500">{domainLabel}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tenant.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {prettify(tenant.status || 'inactive')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <Clock3 size={14} />
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'Unknown date'}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${reachability.className}`}>
                      {domainStatuses[tenant.id] === 'online' && <Wifi size={12} />}
                      {domainStatuses[tenant.id] === 'offline' && <WifiOff size={12} />}
                      {domainStatuses[tenant.id] === 'checking' && <Spinner size={12} className="animate-spin" />}
                      {reachability.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold">{prettify(tenant.plan || 'starter')}</span>
                    <span className="px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">{tenant.currency || 'USD'}</span>
                    {tenantUrl && (
                      <a
                        href={tenantUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-indigo-200 text-indigo-600 font-semibold"
                      >
                        <ExternalLink size={12} /> Visit site
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!primaryDomain && (
                      <span className="text-[11px] text-amber-600 font-semibold">Set VITE_PRIMARY_DOMAIN to enable link checks.</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCheckDomain(tenant)}
                      disabled={isChecking || !tenant.subdomain || !primaryDomain}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-semibold border ${isChecking ? 'border-gray-200 text-gray-400 cursor-wait' : primaryDomain ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      {isChecking ? <Spinner size={12} className="animate-spin" /> : <Link2 size={12} />}
                      {isChecking ? 'Checking...' : 'Check subdomain'}
                    </button>
                    {onDeleteTenant && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(tenant)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {!tenants.length && (
              <div className="text-sm text-gray-500">No tenants detected. Create your first store above.</div>
            )}
          </div>
        </aside>
      </section>

      {pendingDelete && onDeleteTenant && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase text-gray-400 font-semibold">Danger zone</p>
              <h4 className="text-xl font-bold text-gray-900">Archive {pendingDelete.name}?</h4>
              <p className="text-sm text-gray-500">This removes the tenant from the selector and clears cached data. You can recreate it later.</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <p className="font-semibold">subdomain:</p>
              <p>{pendingDelete.subdomain}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeleteModalClose}
                className="px-4 py-2 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
                disabled={deletingId === pendingDelete.id}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className={`px-5 py-2 rounded-2xl font-semibold text-white shadow-lg inline-flex items-center gap-2 ${deletingId === pendingDelete.id ? 'bg-gray-400 cursor-wait' : 'bg-red-600 hover:bg-red-700'}`}
                disabled={deletingId === pendingDelete.id}
              >
                {deletingId === pendingDelete.id ? <LoaderDots /> : <Trash2 size={16} />}
                Delete tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; helper: string; icon: React.ReactNode; accentClass: string; }> = ({ label, value, helper, icon, accentClass }) => (
  <div className="rounded-3xl border border-gray-200 bg-white p-4 flex items-center gap-4">
    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${accentClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase text-gray-400 font-semibold">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{helper}</p>
    </div>
  </div>
);

const LoaderDots = () => (
  <span className="flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></span>
    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></span>
    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></span>
  </span>
);

export default AdminTenantManagement;
