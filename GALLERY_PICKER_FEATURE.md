# Gallery Picker Feature - Documentation

## Overview
This feature allows users to select photos from the existing gallery when adding or editing products, in addition to uploading new images from their device.

## Components

### 1. GalleryPicker Component
**Location:** `/components/GalleryPicker.tsx`

A reusable modal component that displays gallery images and allows users to select one or more images.

#### Props:
- `isOpen` (boolean) - Controls modal visibility
- `onClose` (function) - Callback when modal is closed
- `onSelect` (function) - Callback with selected image URLs
- `multiSelect` (boolean, optional) - Enable multi-select mode (default: true)
- `maxSelection` (number, optional) - Maximum number of images to select (default: 10)
- `currentImages` (string[], optional) - Images already selected (shown as "In Use")

#### Features:
- **Search & Filter**: Real-time search by image title or category
- **Visual Feedback**: 
  - Purple border and checkmark for selected images
  - "In Use" badge for images already added to product
  - Grayed out appearance for unavailable images
- **Selection Counter**: Shows how many images are selected
- **Responsive Grid**: 2-5 columns depending on screen size
- **Toast Notifications**: User-friendly error messages using react-hot-toast

#### Usage Example:
```tsx
<GalleryPicker
  isOpen={isGalleryPickerOpen}
  onClose={() => setIsGalleryPickerOpen(false)}
  onSelect={handleGalleryImagesSelected}
  multiSelect={true}
  maxSelection={10}
  currentImages={formData.galleryImages || []}
/>
```

### 2. AdminProducts Integration
**Location:** `/pages/AdminProducts.tsx`

The product management page has been enhanced to include the gallery picker functionality.

#### Changes Made:
1. **Import GalleryPicker**: Added component import and FolderOpen icon
2. **State Management**: Added `isGalleryPickerOpen` state
3. **Handler Function**: Created `handleGalleryImagesSelected()` to process selected images
4. **UI Updates**: 
   - Added "Choose from Gallery" button in empty state
   - Added dual buttons (Upload/From Gallery) when images exist
   - Integrated toast notifications for user feedback

#### User Flow:

##### When No Images Exist:
1. User opens "Product Images" section
2. Sees upload area with "Click to upload images"
3. Sees "OR" divider
4. Sees blue "Choose from Gallery" button

##### When Images Exist:
1. User sees grid of current product images
2. Can reorder images (left/right arrows)
3. Can delete images
4. Can add more via two buttons:
   - "Upload" - Traditional file upload
   - "From Gallery" - Opens gallery picker

##### Gallery Selection Process:
1. Click "Choose from Gallery" button
2. Gallery picker modal opens
3. Browse/search gallery images
4. Click images to select (purple border appears)
5. Click "Add Selected" button
6. Selected images are added to product
7. Success toast notification appears

## Data Flow

```
Gallery (constants.ts) 
  ↓
DataService (persisted to localStorage)
  ↓
GalleryPicker loads images
  ↓
User selects images
  ↓
handleGalleryImagesSelected() processes selection
  ↓
Images merged with formData.galleryImages
  ↓
Product saved with gallery images
```

## Validation & Constraints

### Maximum Images
- Products can have up to **10 images** total
- Gallery picker enforces this limit dynamically
- If 5 images exist, only 5 more can be selected

### Duplicate Prevention
- Images already in product cannot be selected again
- Shown with "In Use" badge and disabled state

### Required Validation
- Products must have at least 1 image
- Warning shown if less than 5 images (recommended minimum)

## User Experience Enhancements

### Toast Notifications
All user feedback uses `react-hot-toast` for consistency:
- ✅ Success: "Added X image(s) from gallery"
- ❌ Error: "You can select up to 10 images"
- ❌ Error: "Please select at least one image"
- ❌ Error: "You can have up to 10 images total..."

### Visual Indicators
- **Selected Images**: Purple border, ring effect, checkmark overlay
- **In-Use Images**: Gray badge, reduced opacity, not clickable
- **Hover Effects**: Scale animation, overlay visibility
- **Loading State**: Spinner animation during gallery load

### Responsive Design
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns
- Large Desktop: 5 columns

## Technical Details

### Dependencies
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icons (FolderOpen, CheckCircle, etc.)
- `DataService` - Gallery data persistence

### Performance Considerations
- Gallery images loaded once when modal opens
- Search filtering happens in memory (no API calls)
- Images are already optimized WebP format from gallery

### Browser Compatibility
- Works in all modern browsers
- Uses standard React hooks
- CSS uses widely supported properties

## Testing Checklist

- [ ] Gallery picker opens/closes correctly
- [ ] Search filters images by title and category
- [ ] Multi-select works with visual feedback
- [ ] "In Use" badge prevents duplicate selection
- [ ] Max selection limit enforced (10 images)
- [ ] Selected images added to product successfully
- [ ] Toast notifications appear appropriately
- [ ] Upload button still works alongside gallery picker
- [ ] Images can be reordered in product
- [ ] Product saves with gallery images
- [ ] Edited products show existing gallery images
- [ ] Responsive layout works on all screen sizes

## Future Enhancements

Potential improvements for this feature:
1. Add category filtering dropdown in gallery picker
2. Support drag-and-drop reordering in gallery picker
3. Add image preview/lightbox functionality
4. Implement infinite scroll for large galleries
5. Add bulk actions (select all in category, etc.)
6. Support uploading new images directly from gallery picker
7. Add image editing capabilities (crop, resize, etc.)

## Troubleshooting

### Gallery Not Loading
- Check browser console for errors
- Verify DataService is working
- Check GALLERY_IMAGES constant in constants.ts

### Images Not Appearing in Product
- Verify handleGalleryImagesSelected is called
- Check formData.galleryImages state
- Ensure images are saved when product is submitted

### Selection Not Working
- Check if maxSelection limit reached
- Verify image not already in currentImages
- Check browser console for errors

## Support
For issues or questions, please refer to the main project documentation or create an issue in the repository.
