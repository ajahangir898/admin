# Role-Based Access Control (RBAC) System

## Overview

This document describes the complete RBAC system implemented for the React E-commerce Admin Panel. The system provides comprehensive authentication and authorization capabilities with granular permission control.

## Architecture

### Backend (Node.js/Express + MongoDB)

#### Models

1. **User Model** (`backend/src/models/User.ts`)
   - Stores user credentials and profile information
   - Fields: name, email, password (hashed), phone, role, roleId, tenantId, isActive, lastLogin
   - Built-in roles: `super_admin`, `admin`, `tenant_admin`, `staff`, `customer`

2. **Role Model** (`backend/src/models/Role.ts`)
   - Stores custom role definitions
   - Fields: name, description, tenantId, isSystem
   - Linked to permissions through Permission model

3. **Permission Model** (`backend/src/models/Permission.ts`)
   - Stores granular permissions for each role
   - Fields: roleId, resource, actions[]
   - Resources: dashboard, orders, products, customers, inventory, catalog, landing_pages, gallery, reviews, daily_target, business_report, expenses, income, due_book, profit_loss, notes, customization, settings, admin_control, tenants
   - Actions: read, write, edit, delete

#### Middleware

**Auth Middleware** (`backend/src/middleware/auth.ts`)
- `authenticateToken` - Verifies JWT token and attaches user to request
- `optionalAuth` - Allows unauthenticated access but attaches user if token present
- `requireRole(roles)` - Requires user to have specific built-in role
- `requirePermission(resource, action)` - Checks granular permission
- `requireAnyPermission(permissions)` - Checks if user has any of the specified permissions

#### Routes

**Auth Routes** (`backend/src/routes/auth.ts`)
- `POST /api/auth/login` - Login with email/password, returns JWT
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/permissions` - Get current user's permissions
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/admin/users` - List all admin users
- `POST /api/auth/admin/users` - Create new user
- `PUT /api/auth/admin/users/:id` - Update user
- `DELETE /api/auth/admin/users/:id` - Delete user
- `PATCH /api/auth/admin/users/:id/role` - Update user's custom role
- `GET /api/auth/admin/roles` - List all roles
- `POST /api/auth/admin/roles` - Create new role
- `PUT /api/auth/admin/roles/:id` - Update role
- `DELETE /api/auth/admin/roles/:id` - Delete role
- `GET /api/auth/admin/resources` - Get available resources and actions

### Frontend (React + TypeScript)

#### Components

1. **AuthContext** (`context/AuthContext.tsx`)
   - Provides authentication state throughout the app
   - Methods: login, logout, register, refreshToken
   - Permission checking: hasPermission, canRead, canWrite, canEdit, canDelete

2. **usePermissions Hook** (`hooks/usePermissions.ts`)
   - `usePermissions(resource, action)` - Check single permission
   - `useResourceAccess(resource)` - Get all CRUD permissions for a resource
   - `useAdminAccess()` - Check if user has admin control access
   - `useCanAccess(resource)` - Check read access to resource

3. **ProtectedRoute** (`components/ProtectedRoute.tsx`)
   - `<ProtectedRoute>` - Protects entire routes
   - `<ProtectedElement>` - Conditionally renders UI elements
   - `<RequireRole>` - Requires specific built-in role
   - `withPermission(Component)` - HOC for permission-based rendering

4. **AdminLogin** (`pages/AdminLogin.tsx`)
   - Login page with email/password form
   - Shows loading and error states
   - Redirects to admin panel on success

5. **AdminControlNew** (`pages/AdminControlNew.tsx`)
   - Complete user and role management UI
   - User CRUD with role assignment
   - Role CRUD with permission matrix
   - Visual permission editor (Read/Write/Edit/Delete per resource)

6. **Auth Service** (`services/authService.ts`)
   - API client for all auth endpoints
   - Local storage management for tokens
   - Permission checking utilities

## Role Hierarchy

```
super_admin (Full Access)
    ↓
admin (All except tenant management)
    ↓
tenant_admin (Tenant-scoped full access)
    ↓
staff (Custom role permissions)
    ↓
customer (Store access only)
```

## Permission Matrix

| Resource | Description | Actions |
|----------|-------------|---------|
| dashboard | Main dashboard | R |
| orders | Order management | R, W, E, D |
| products | Product catalog | R, W, E, D |
| customers | Customer list | R, W, E, D |
| inventory | Stock management | R, W, E, D |
| catalog | Categories, brands, tags | R, W, E, D |
| landing_pages | Marketing pages | R, W, E, D |
| gallery | Media library | R, W, E, D |
| reviews | Customer reviews | R, W, E, D |
| daily_target | Sales targets | R, W, E, D |
| business_report | Analytics | R |
| expenses | Expense tracking | R, W, E, D |
| income | Income tracking | R, W, E, D |
| due_book | Due management | R, W, E, D |
| profit_loss | P&L reports | R |
| notes | Admin notes | R, W, E, D |
| customization | Theme settings | R, W, E |
| settings | System settings | R, W, E |
| admin_control | User/role management | R, W, E, D |
| tenants | Multi-tenant management | R, W, E, D |

## Usage Examples

### Protecting a Route

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute 
  resource="orders" 
  action="read"
  fallbackPath="/dashboard"
>
  <AdminOrders />
</ProtectedRoute>
```

### Protecting a UI Element

```tsx
import { ProtectedElement } from './components/ProtectedRoute';

<ProtectedElement resource="products" action="delete">
  <button onClick={handleDelete}>Delete Product</button>
</ProtectedElement>
```

### Using Permission Hook

```tsx
import { usePermissions, useResourceAccess } from './hooks/usePermissions';

function ProductActions() {
  const canDelete = usePermissions('products', 'delete');
  const { canRead, canWrite, canEdit, canDelete: canRemove } = useResourceAccess('products');
  
  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canRemove && <button>Delete</button>}
    </div>
  );
}
```

### Requiring a Role

```tsx
import { RequireRole } from './components/ProtectedRoute';

<RequireRole roles={['super_admin', 'admin']}>
  <AdminSettings />
</RequireRole>
```

## API Authentication

All protected API endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login Request

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "permissions": [
    { "resource": "orders", "actions": ["read", "write", "edit", "delete"] },
    { "resource": "products", "actions": ["read", "write", "edit"] }
  ]
}
```

## Environment Variables

```env
# Backend
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/admin

# Frontend
VITE_API_URL=http://localhost:5001/api
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
2. **JWT Tokens**: Tokens expire after 7 days by default
3. **Role Hierarchy**: Super admin bypasses all permission checks
4. **System Roles**: Built-in roles cannot be deleted
5. **Self-Protection**: Users cannot delete their own accounts
6. **Permission Validation**: Both frontend and backend validate permissions

## Files Created/Modified

### New Files
- `backend/src/models/User.ts`
- `backend/src/models/Role.ts`
- `backend/src/models/Permission.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/routes/auth.ts`
- `context/AuthContext.tsx`
- `hooks/usePermissions.ts`
- `components/ProtectedRoute.tsx`
- `pages/AdminLogin.tsx`
- `pages/AdminControlNew.tsx`
- `pages/AdminAppWithAuth.tsx`
- `services/authService.ts`

### Modified Files
- `backend/src/config/env.ts` - Added JWT configuration
- `backend/src/index.ts` - Added auth routes
- `pages/AdminApp.tsx` - Integrated auth service, updated handlers
