# Gallery Picker - Quick Start Guide

## Overview
The Gallery Picker feature allows users to select existing images from the gallery when creating or editing products, eliminating the need to re-upload the same images.

## How to Use

### For End Users

#### Adding Products with Gallery Images:

1. **Navigate to Products**
   - Go to Admin Panel → Products
   - Click "Add Product" button

2. **Expand Product Images Section**
   - Scroll to "🖼️ Product Images" section
   - Click to expand if collapsed

3. **Choose Images - Two Options:**

   **Option A: Upload New Images**
   - Click the upload area or "Upload" button
   - Select files from your computer
   - Images automatically converted to WebP

   **Option B: Choose from Gallery**
   - Click the blue "Choose from Gallery" button
   - Gallery picker modal opens
   - Search or browse gallery images
   - Click images to select (purple border appears)
   - Click "Add Selected (X)" button
   - Selected images added to product

4. **Manage Images**
   - Reorder using ← → arrows
   - Delete using trash icon
   - First image is the primary/main image

5. **Save Product**
   - Fill in other required fields (name, price, etc.)
   - Click "Save Product"
   - Product saved with all selected images

### For Developers

#### Using the GalleryPicker Component:

```tsx
import { GalleryPicker } from '../components/GalleryPicker';

// In your component
const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
const [selectedImages, setSelectedImages] = useState<string[]>([]);

const handleGallerySelect = (imageUrls: string[]) => {
  setSelectedImages([...selectedImages, ...imageUrls]);
};

// In your JSX
<button onClick={() => setIsGalleryPickerOpen(true)}>
  Choose from Gallery
</button>

<GalleryPicker
  isOpen={isGalleryPickerOpen}
  onClose={() => setIsGalleryPickerOpen(false)}
  onSelect={handleGallerySelect}
  multiSelect={true}
  maxSelection={10}
  currentImages={selectedImages}
/>
```

## Key Features

✅ **Multi-Select** - Select multiple images at once
✅ **Search** - Filter by title or category
✅ **Visual Feedback** - See selected images with purple border
✅ **Duplicate Prevention** - Can't select same image twice
✅ **Max Limit** - Enforces 10 image maximum per product
✅ **Responsive** - Works on all screen sizes
✅ **Toast Notifications** - Clear feedback messages

## Visual Guide

### Gallery Picker Modal
```
┌─────────────────────────────────────────────┐
│ [X] Choose from Gallery                     │
│     Select up to 10 images from your gallery│
├─────────────────────────────────────────────┤
│ [🔍 Search...]                              │
├─────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ ✓   │ │     │ │ ✓   │ │IN   │ │     │   │
│ │IMG1 │ │IMG2 │ │IMG3 │ │USE  │ │IMG5 │   │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │     │ │     │ │ ✓   │ │     │ │     │   │
│ │IMG6 │ │IMG7 │ │IMG8 │ │IMG9 │ │IMG10│   │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────────────┤
│ 3 images selected (max 10)                  │
│              [Cancel] [Add Selected (3)] ✓  │
└─────────────────────────────────────────────┘
```

### Product Form - Empty State
```
┌──────────────────────────────────┐
│ 🖼️ Product Images               │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │         📤 Upload            │ │
│ │   Click to upload images     │ │
│ │   JPG, PNG • Max 2MB each    │ │
│ └──────────────────────────────┘ │
│          ─── OR ───              │
│ ┌──────────────────────────────┐ │
│ │  📁 Choose from Gallery      │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Product Form - With Images
```
┌──────────────────────────────────┐
│ 🖼️ Product Images               │
├──────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │PRI │ │IMG │ │IMG │ │IMG │    │
│ │ ← ✕│ │← ✕→│ │← ✕→│ │← ✕ │    │
│ └────┘ └────┘ └────┘ └────┘    │
│                                  │
│ [📤 Upload (4/10)] [📁 Gallery] │
└──────────────────────────────────┘
```

## Troubleshooting

### Issue: Gallery picker doesn't open
**Solution:** Check browser console for errors, ensure DataService is available

### Issue: Images not appearing after selection
**Solution:** Check that handleGalleryImagesSelected is properly connected

### Issue: Can't select more images
**Solution:** Check if you've reached the 10 image maximum

### Issue: Image shows "In Use"
**Solution:** This image is already added to the product, remove it first to re-add

## Technical Details

**Component:** `components/GalleryPicker.tsx`
**Integration:** `pages/AdminProducts.tsx`
**Data Source:** `constants.ts` (GALLERY_IMAGES)
**Storage:** localStorage via DataService
**Dependencies:** react-hot-toast, lucide-react

## Support

For detailed documentation, see:
- `GALLERY_PICKER_FEATURE.md` - Complete feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details

For issues, please check the troubleshooting section or create an issue in the repository.

---

**Version:** 1.0.0
**Last Updated:** 2025-01-13
