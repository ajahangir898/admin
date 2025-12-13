# Admin Login Route Implementation

## Overview
Created a separate admin login page at `/admin/login` for admin and staff users, while keeping the store login for customers only.

## Changes Made

### 1. Modified `pages/AdminLogin.tsx`
- **Fixed imports**: Removed `useNavigate` from react-router-dom (app doesn't use react-router)
- **Fixed imports**: Removed `useAuth` hook dependency
- **Updated login logic**: Now uses `authService.login()` directly
- **Added role validation**: Only allows roles: `admin`, `super_admin`, `tenant_admin`, `staff`
- **Rejects customer logins**: Shows error "Access denied. This login is for admin and staff users only."
- **Navigation**: Uses `window.location.href = '/admin'` instead of useNavigate
- **Security**: Calls `authService.logout()` if role validation fails
- **UI**: Changed icon from Lock to Shield, updated title to "Admin Portal"
- **Footer link**: Added "Customer? Visit Store" link pointing to "/"

### 2. Updated `App.tsx`
- **Added lazy import**: `const AdminLogin = lazy(() => import('./pages/AdminLogin'));`
- **Extended ViewState type**: Added `'admin-login'` to the union type
- **Updated syncViewWithLocation()**: Added route handler for `/admin/login`
  ```typescript
  if (trimmedPath === 'admin/login') {
    setCurrentView('admin-login');
    return;
  }
  ```
- **Added view rendering**: Renders `<AdminLogin />` when `currentView === 'admin-login'`

### 3. Authentication Flow

#### Admin/Staff Login Flow:
1. User navigates to `/admin/login`
2. App.tsx detects route and sets view to `'admin-login'`
3. AdminLogin component renders
4. User enters credentials
5. authService.login() is called
6. Role validation checks if user is admin/staff
7. If valid: Redirects to `/admin`
8. If customer: Shows error and logs out

#### Customer Login Flow (unchanged):
1. User clicks login on store page
2. LoginModal opens (from StoreComponents)
3. Customer can login with any role
4. Redirects to store/profile

## Routes

| Route | Purpose | Allowed Roles | Component |
|-------|---------|---------------|-----------|
| `/` | Store homepage | All (public) | StoreHome |
| `/admin/login` | Admin login page | admin, super_admin, tenant_admin, staff | AdminLogin |
| `/admin` | Admin dashboard | admin, super_admin, tenant_admin, staff | AdminAppWithAuth |

## Security Features

1. **Role-based access control**: Admin login validates user role after authentication
2. **Automatic logout**: If customer tries to use admin login, their session is cleared
3. **Clear error messages**: Users are informed when they don't have access
4. **Separate entry points**: Admin and customer logins are completely separate

## Testing Checklist

- [ ] Navigate to `/admin/login` - should show admin login page
- [ ] Login with admin credentials - should redirect to `/admin`
- [ ] Login with staff credentials - should redirect to `/admin`
- [ ] Login with customer credentials - should show error and prevent access
- [ ] Click "Customer? Visit Store" - should navigate to `/`
- [ ] Store login modal - should still work for all users
- [ ] Direct navigation to `/admin` without login - should require authentication

## Technical Notes

- **No react-router dependency**: App uses custom view-based routing with `window.location.pathname`
- **Auth service**: Uses existing `authService.login(email, password)` from `services/authService.ts`
- **Storage**: Login credentials stored in localStorage (TOKEN_KEY, USER_KEY, PERMISSIONS_KEY)
- **View management**: Custom ViewState system with currentView state variable
- **URL sync**: syncViewWithLocation() function maps URLs to views

## Files Modified

1. `admin/pages/AdminLogin.tsx` - Fixed imports, added role validation
2. `admin/App.tsx` - Added route handling and view rendering
