# Communication & CRM Implementation Summary

## Overview
This implementation adds comprehensive Communication & CRM features to the SuperAdmin dashboard, enabling the platform to be the "Voice of the Platform" as specified in the requirements.

## Features Implemented

### 1. Bulk Announcements System
**Purpose**: Send system-wide notifications or emails to all merchants

**Backend Components**:
- `Announcement` model (`backend/src/models/Announcement.ts`)
  - Stores announcement data with title, message, type, priority
  - Supports targeting all merchants or specific tenants
  - Tracks read status per tenant
  - Supports draft, scheduled, and sent states

- Announcement routes (`backend/src/routes/announcements.ts`)
  - `GET /api/announcements` - List all announcements (super_admin only)
  - `GET /api/announcements/active` - Get active announcements for current tenant
  - `GET /api/announcements/:id` - Get single announcement
  - `POST /api/announcements` - Create new announcement (super_admin only)
  - `PATCH /api/announcements/:id` - Update announcement (super_admin only)
  - `POST /api/announcements/:id/send` - Send announcement to targets (super_admin only)
  - `POST /api/announcements/:id/mark-read` - Mark announcement as read
  - `DELETE /api/announcements/:id` - Delete announcement (super_admin only)

**Frontend Components**:
- Bulk Announcements tab in Communication & CRM section
- Form to create announcements with:
  - Title and message
  - Type (maintenance, feature, update, alert, general)
  - Priority (low, medium, high, urgent)
  - Target selection (all merchants or specific tenants)
- List view showing all announcements with status
- Send and delete actions

**Real-time Features**:
- Socket.IO integration for instant delivery
- Notifications created automatically when announcements are sent
- Real-time updates to merchant dashboards

### 2. Merchant Success Tracking (At-Risk Detection)
**Purpose**: Automated alerts for "At-Risk" merchants

**Risk Criteria** (configurable constants):
- No login for 14+ days
- Revenue drop of 80% or more
- No orders for 30+ days

**Backend Components**:
- `MerchantActivity` model (`backend/src/models/MerchantActivity.ts`)
  - Tracks lastLoginAt, lastOrderAt
  - Stores totalOrders, totalRevenue, previousRevenue
  - Calculates revenueDropPercentage
  - Maintains isAtRisk flag and riskReasons array

- Merchant Tracking routes (`backend/src/routes/merchantTracking.ts`)
  - `GET /api/merchant-tracking/at-risk` - List at-risk merchants (super_admin only)
  - `GET /api/merchant-tracking/stats` - Get merchant health statistics
  - `POST /api/merchant-tracking/update` - Update merchant activity manually
  - `POST /api/merchant-tracking/scan` - Scan all merchants and update risk status
  - `POST /api/merchant-tracking/:tenantId/track-login` - Track login activity

**Automatic Tracking**:
- Login tracking: Integrated into auth route (`backend/src/routes/auth.ts`)
  - Updates lastLoginAt on successful login
  - Recalculates at-risk status
  
- Order tracking: Integrated into orders route (`backend/src/routes/orders.ts`)
  - Updates lastOrderAt when order is created
  - Tracks totalOrders and totalRevenue
  - Stores previousRevenue for drop calculation

**Frontend Components**:
- At-Risk Merchants tab showing:
  - Statistics cards (total, at-risk, healthy merchants)
  - List of at-risk merchants with detailed information
  - Risk reasons for each merchant
  - "Scan All Merchants" button for manual updates
  - Merchant details including orders, revenue, and activity

### 3. Support Ticket System Integration
**Purpose**: Built-in helpdesk integration

**Implementation**:
- Support Tickets tab in Communication & CRM section
- Links to existing support ticket system
- Note: Existing support ticket infrastructure was already in place
  - Routes: `backend/src/routes/support.ts`
  - Model: `backend/src/models/SupportTicket.ts`

## Technical Architecture

### Database Models
1. **Announcement**
   - Collection: `announcements`
   - Indexes: status, type, createdAt
   - Schema includes: title, message, type, priority, status, targetTenants, createdBy, scheduledFor, sentAt, readBy

2. **MerchantActivity**
   - Collection: `merchant_activities`
   - Indexes: tenantId, isAtRisk, lastLoginAt
   - Schema includes: tenantId, lastLoginAt, lastOrderAt, totalOrders, totalRevenue, previousRevenue, revenueDropPercentage, isAtRisk, riskReasons

### API Routes
All routes are protected with authentication middleware (`authenticateToken`)
Super admin routes additionally check `role === 'super_admin'`

### Frontend Integration
- New Communication & CRM tab added to SuperAdmin sidebar
- Component: `components/superadmin/CommunicationTab.tsx`
- Sub-tabs for Announcements, At-Risk Merchants, and Support Tickets
- Responsive design matching existing UI patterns
- Real-time updates using fetch API

### Security Considerations
- All routes require authentication
- Super admin-only operations properly restricted
- Input validation using Zod schemas
- Proper error handling throughout
- **Note**: CodeQL scanner recommends adding rate limiting middleware (architectural consideration)

## Testing
- Created component tests: `components/superadmin/CommunicationTab.test.tsx`
- All tests passing
- Tests verify:
  - Component rendering
  - Tab navigation
  - Empty states
  - Data loading

## Configuration
Risk criteria can be adjusted by modifying constants in `backend/src/routes/merchantTracking.ts`:
```typescript
const RISK_CRITERIA = {
  NO_LOGIN_DAYS: 14,
  NO_ORDER_DAYS: 30,
  REVENUE_DROP_PERCENTAGE: 80
};
```

## Future Enhancements
1. **Rate Limiting**: Implement rate limiting middleware for all API routes
2. **Email Notifications**: Integrate SMTP for email delivery of announcements
3. **Revenue Tracking**: Implement time-series database or periodic snapshots for more accurate revenue drop detection
4. **Scheduled Announcements**: Implement cron job to send scheduled announcements
5. **Analytics**: Add charts and graphs for merchant health trends
6. **Export**: Add CSV/PDF export for at-risk merchant reports

## Files Changed/Created

### Backend
- Created: `backend/src/models/Announcement.ts`
- Created: `backend/src/models/MerchantActivity.ts`
- Created: `backend/src/routes/announcements.ts`
- Created: `backend/src/routes/merchantTracking.ts`
- Modified: `backend/src/index.ts` (registered new routes)
- Modified: `backend/src/routes/auth.ts` (added login tracking)
- Modified: `backend/src/routes/orders.ts` (added order tracking)

### Frontend
- Created: `components/superadmin/CommunicationTab.tsx`
- Created: `components/superadmin/CommunicationTab.test.tsx`
- Modified: `components/superadmin/index.ts` (exported new component)
- Modified: `components/superadmin/types.ts` (added 'communication' tab type)
- Modified: `components/superadmin/Sidebar.tsx` (added Communication & CRM menu item)
- Modified: `pages/SuperAdminDashboard.tsx` (integrated Communication tab)

## Summary
This implementation provides a complete Communication & CRM system that enables the SuperAdmin to:
1. Send bulk announcements to all or specific merchants
2. Track merchant health and identify at-risk merchants automatically
3. Access the existing support ticket system from a centralized dashboard

All features are fully integrated with the existing authentication, authorization, and real-time notification systems.
