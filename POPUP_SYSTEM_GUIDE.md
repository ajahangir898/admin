# Popup System Documentation

## Overview
The popup system allows admins to create and manage promotional popups that automatically display on the store home page. Popups can include images, links, and display priorities.

## Features

### Admin Panel Features
- **Create/Edit Popups**: Add new popups with images and optional links
- **Priority Management**: Set display order using priority numbers (lower = first)
- **Status Control**: Draft or Publish popups
- **URL Linking**: Add internal or external links to popups
- **Search & Filter**: Find popups by name and filter by status
- **Bulk Management**: Edit, delete, or toggle status of popups

### Store Display Features
- **Automatic Display**: Published popups show automatically after 1.5 seconds
- **Sequential Display**: Multiple popups display one after another (30-second intervals)
- **Click Navigation**: Clicking popup navigates to linked URL
- **Responsive Design**: Works on all devices
- **Close Button**: Users can dismiss popups
- **Fade Animations**: Smooth appearance and disappearance

## How to Use

### Creating a Popup

1. Go to Admin Panel → **Popups** (in sidebar)
2. Click **"+ Add Popup"** button
3. Fill in the form:
   - **Popup Name**: Descriptive name (e.g., "Friday Up To 50% Off")
   - **Popup Image**: Upload image or paste URL
   - **Link URL** (Optional): Where popup should navigate when clicked
   - **URL Type**: Internal (within store) or External (new tab)
   - **Priority**: Display order (0 = first, 1 = second, etc.)
   - **Status**: Draft (hidden) or Publish (visible)
4. Click **"Save Popup"**

### Managing Popups

#### Edit Popup
- Click the **edit icon** (pencil) on any popup row
- Update fields and save

#### Delete Popup
- Click the **trash icon** on any popup row
- Confirm deletion

#### Toggle Status
- Click the **status badge** (Draft/Publish) to toggle
- Only Published popups appear on store

#### Search Popups
- Use search bar to find by name
- Filter by status: All, Draft, or Publish

### Best Practices

1. **Image Size**: Use high-quality images (recommended: 800x600px or 1200x800px)
2. **Priority**: Lower numbers = higher priority (0 displays first)
3. **Timing**: Don't overwhelm users - 2-3 active popups maximum
4. **Mobile**: Test popups on mobile devices for readability
5. **Links**: Use internal links for product pages (/products) or external for campaigns

## Technical Details

### Files Created/Modified

**New Files:**
- `pages/AdminPopups.tsx` - Admin popup management page
- `components/StorePopup.tsx` - Store popup display component
- `types.ts` - Added Popup interface

**Modified Files:**
- `pages/StoreHome.tsx` - Integrated popup display logic
- `pages/AdminApp.tsx` - Added popup route
- `components/AdminComponents.tsx` - Added popup menu item

### Data Structure

```typescript
interface Popup {
  id: number;
  name: string;
  image: string;
  url?: string;
  urlType?: 'Internal' | 'External';
  priority?: number;
  status: 'Draft' | 'Publish';
  createdAt?: string;
  updatedAt?: string;
}
```

### Storage
- Popups are stored in DataService under key `'popups'`
- Automatically persisted across sessions
- Tenant-scoped (each tenant has their own popups)

### Display Logic
1. On store load, fetch all Published popups
2. Sort by priority (ascending)
3. Display first popup after 1.5-second delay
4. After user closes, wait 30 seconds then show next
5. Continue until all popups shown

## Troubleshooting

**Popup not showing?**
- Check status is "Publish" not "Draft"
- Clear browser cache
- Check browser console for errors

**Image not loading?**
- Verify image URL is accessible
- Check image format (JPG, PNG, GIF supported)
- Try re-uploading image

**Link not working?**
- Verify URL format (internal: `/products`, external: `https://...`)
- Check URL Type matches link format
- Test link separately first

## Future Enhancements

Potential improvements:
- Scheduled popups (start/end dates)
- A/B testing support
- Analytics (views, clicks, conversion)
- Multiple image support (carousel)
- Video popup support
- Geographic targeting
- User segment targeting
