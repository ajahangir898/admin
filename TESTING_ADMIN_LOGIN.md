# Testing Guide - Admin Login Route

## Test URLs

- **Store Login (Customer)**: http://localhost:3001/
- **Admin Login (Admin/Staff)**: http://localhost:3001/admin/login
- **Admin Dashboard**: http://localhost:3001/admin

## Test Scenarios

### 1. Admin Login Flow
1. Navigate to http://localhost:3001/admin/login
2. You should see the Admin Portal login page with Shield icon
3. Login with admin credentials
4. Should redirect to http://localhost:3001/admin (admin dashboard)

### 2. Staff Login Flow
1. Navigate to http://localhost:3001/admin/login
2. Login with staff user credentials
3. Should redirect to http://localhost:3001/admin

### 3. Customer Login Rejection
1. Navigate to http://localhost:3001/admin/login
2. Try to login with customer credentials
3. Should see error: "Access denied. This login is for admin and staff users only."
4. Session should be cleared automatically

### 4. Customer Store Login
1. Navigate to http://localhost:3001/
2. Click login button on store page
3. Customer login modal should open
4. Customers can login successfully

### 5. Navigation Links
1. On admin login page, click "Customer? Visit Store" link
2. Should navigate to http://localhost:3001/

## Test Admin Credentials

Based on the backend API responses, you should have users with these roles:
- `admin`
- `super_admin`
- `tenant_admin`
- `staff`
- `customer`

Use any existing admin/staff user to test the login flow.

## Expected Behavior

| Scenario | Expected Result |
|----------|----------------|
| Admin logs in via `/admin/login` | ✅ Redirects to `/admin` dashboard |
| Staff logs in via `/admin/login` | ✅ Redirects to `/admin` dashboard |
| Customer logs in via `/admin/login` | ❌ Shows error message, clears session |
| Direct access to `/admin/login` | ✅ Shows admin login page |
| Direct access to `/admin` without auth | ❌ Should require authentication |
| Customer login via store | ✅ Works normally |

## Debugging

If you encounter issues:

1. **Check browser console** for any JavaScript errors
2. **Check network tab** for API calls to `/auth/login`
3. **Verify localStorage** has correct token after login
4. **Check backend terminal** for login requests

### Browser Console Commands

```javascript
// Check if user is logged in
localStorage.getItem('admin_auth_user')

// Check token
localStorage.getItem('admin_auth_token')

// Clear session (logout)
localStorage.removeItem('admin_auth_user')
localStorage.removeItem('admin_auth_token')
localStorage.removeItem('admin_auth_permissions')
```

## Files to Review

- [pages/AdminLogin.tsx](pages/AdminLogin.tsx) - Admin login page component
- [App.tsx](App.tsx) - Routing logic for `/admin/login`
- [services/authService.ts](services/authService.ts) - Authentication API calls
- [ADMIN_LOGIN_IMPLEMENTATION.md](ADMIN_LOGIN_IMPLEMENTATION.md) - Implementation details
