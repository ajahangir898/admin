export interface BaseModel {
  _id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant extends BaseModel {
  name: string;
  subdomain: string;
  customDomain?: string | null;
  contactEmail: string;
  contactName?: string;
  adminEmail: string;
  adminAuthUid?: string;
  plan: 'starter' | 'growth' | 'enterprise' | string;
  status: 'trialing' | 'active' | 'suspended' | 'archived' | string;
  onboardingCompleted: boolean;
  branding?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface CreateTenantPayload {
  name: string;
  subdomain: string;
  contactEmail: string;
  contactName?: string;
  adminEmail: string;
  adminPassword: string;
  plan?: Tenant['plan'];
}
