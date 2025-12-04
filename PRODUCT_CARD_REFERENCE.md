# ProductCard UI Reference

## Before vs After

### BEFORE (Old style2)
```
┌──────────────────────────┐
│  [image with padding]    │
│                          │
│  ⭐⭐⭐⭐⭐               │
│  Product Name Here       │
│  Description...          │
│  ৳1000  ৳1500           │
│  Get 50 Coins            │
│  [──Buy Now──]  [🛒]    │
└──────────────────────────┘
```

### AFTER (New style2 - Matches Screenshot) ✨
```
┌──────────────────────────┐
│ ❤️         [SALE]        │ ← Heart icon + Badge
│                          │
│  [full-width image]      │
│  (zooms on hover)        │
│                          │
│ ⭐⭐⭐⭐⭐ (0) 0 Sold     │ ← Rating + Reviews + Sold count
│ Product Name Here        │ ← Pink on hover
│ Description text...      │ ← 2-line clamp
│ ৳1000  ৳1500            │ ← Pink price + strikethrough
│ Get 50 Coins (cyan)      │ ← Cyan blue text
│ [──Buy Now──]  [🛒]     │ ← Both buttons clickable
└──────────────────────────┘
```

---

## Key Changes

### 1. Image Container
**Before:**
- Had padding (p-4 pb-0)
- White background
- max-h/max-w with object-contain
- Image smaller with margins

**After:**
- Full width (100%)
- Gray background for clarity
- object-cover (fills container)
- Larger display (h-40 md:h-48)

### 2. Heart Icon
**Before:**
- Gray text, no background
- Small size

**After:**
- White background with rounded corners
- Top-left positioning (absolute)
- Red on hover
- Bigger and more visible

### 3. SALE Badge
**Before:**
- Small red badge

**After:**
- Still red, but better positioned
- Only shows if discount exists
- Consistent styling

### 4. Rating Section
**Before:**
- Just stars and review count
- No "Sold" info

**After:**
- Stars (yellow for rating)
- Review count: `(0)` format
- Sold count on right: `0 Sold`

### 5. Description
**New Feature:**
- Shows product description below name
- 2-line clamp (line-clamp-2)
- Gray text

### 6. Coins Display
**Before:**
- Blue text "Get 50 Coins"

**After:**
- Cyan blue text
- Same format "Get X Coins"
- Dynamic: `Math.floor(price / 100)`

### 7. Buttons
**Before:**
- Buy Now button full-width
- Cart button beside it

**After:**
- Same layout (flex gap-2)
- Better hover/active effects
- Active scale animation (95%)
- Click handlers properly isolated

---

## CSS Classes Explained

```tsx
// Image container
className="relative h-40 md:h-48 flex items-center justify-center bg-gray-50 overflow-hidden"
// ├─ relative: positioning context for absolute children
// ├─ h-40 md:h-48: height 160px, 192px on tablet+
// ├─ bg-gray-50: light gray background
// └─ overflow-hidden: clips image edges

// Heart button
className="absolute top-3 left-3 text-gray-300 hover:text-red-500 transition z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm"
// ├─ absolute top-3 left-3: position in corner
// ├─ bg-white/80: 80% opaque white
// ├─ rounded-full: circle shape
// └─ z-10: appear above image

// Rating section
className="flex items-center gap-2 mb-2"
// ├─ items-center: vertical align
// ├─ gap-2: space between children
// └─ mb-2: margin bottom

// Price text
className="text-pink-600 font-bold text-lg"
// ├─ text-pink-600: pink color
// ├─ font-bold: bold weight
// └─ text-lg: larger size

// Coins text
className="text-xs text-cyan-500 font-bold"
// ├─ text-xs: tiny size
// ├─ text-cyan-500: cyan color
// └─ font-bold: bold weight

// Buy button
className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded text-xs font-bold transition shadow-md hover:shadow-lg active:scale-95"
// ├─ flex-1: takes available space
// ├─ bg-pink-500: pink background
// ├─ hover:bg-pink-600: darker pink on hover
// ├─ active:scale-95: shrinks when pressed
// └─ transition: smooth animation

// Cart button
className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2.5 rounded transition active:scale-95"
// ├─ bg-blue-100: light blue background
// ├─ text-blue-600: blue text
// ├─ p-2.5: padding
// └─ rounded: standard border-radius
```

---

## Responsive Design

```
Mobile (default):
┌────────────────┐
│ H: 160px (h-40)│
│ Image full     │
│ Small text     │
└────────────────┘

Tablet+ (md:):
┌────────────────────┐
│ H: 192px (h-48)    │
│ Image larger       │
│ More padding       │
└────────────────────┘
```

---

## HTML Structure

```tsx
<div className="...card wrapper...">
  
  {/* Image Container */}
  <div className="...image container...">
    <button className="...heart icon...">❤️</button>
    <span className="...SALE badge...">SALE</span>
    <img src="..." alt="..." />
  </div>
  
  {/* Content Container */}
  <div className="...content...">
    
    {/* Rating Row */}
    <div className="flex items-center gap-2">
      {/* Stars */}
      {/* Reviews (0) */}
      {/* Sold Count */}
    </div>
    
    {/* Product Name */}
    <h3>Product Name</h3>
    
    {/* Description */}
    <p>Product description...</p>
    
    {/* Pricing Section */}
    <div>
      {/* Price & Original */}
      {/* Coins */}
    </div>
    
    {/* Buttons */}
    <div className="flex gap-2">
      <button>Buy Now</button>
      <button><ShoppingCart/></button>
    </div>
    
  </div>
</div>
```

---

## Color Palette

| Element | Color | Tailwind |
|---------|-------|----------|
| Card Background | White | bg-white |
| Card Border | Light Gray | border-gray-200 |
| Image Background | Very Light Gray | bg-gray-50 |
| Product Name | Dark Gray | text-gray-800 |
| Hover Name | Pink | hover:text-pink-600 |
| Description | Gray | text-gray-500 |
| Star (Active) | Yellow | text-yellow-400 |
| Star (Inactive) | Light Gray | text-gray-200 |
| Review Text | Light Gray | text-gray-500 |
| Price | Pink | text-pink-600 |
| Original Price | Gray | text-gray-400 |
| Coins | Cyan | text-cyan-500 |
| Buy Button | Pink | bg-pink-500 |
| Buy Button Hover | Dark Pink | hover:bg-pink-600 |
| Cart Button | Light Blue | bg-blue-100 |
| Cart Icon | Blue | text-blue-600 |
| Heart (Default) | Light Gray | text-gray-300 |
| Heart (Hover) | Red | hover:text-red-500 |

---

## Usage in Components

The ProductCard is used in several places. To use the new style2:

```tsx
import { ProductCard } from './components/StoreComponents';

// Use with variant="style2" for the new design
<ProductCard 
  product={product}
  onClick={(p) => handleSelectProduct(p)}
  variant="style2"
/>

// Default (variant="style1") uses the original style
<ProductCard 
  product={product}
  onClick={(p) => handleSelectProduct(p)}
  // variant="style1" (default)
/>

// Also has style3 (minimalist bordered)
<ProductCard 
  product={product}
  onClick={(p) => handleSelectProduct(p)}
  variant="style3"
/>
```

---

## Data Requirements

The ProductCard expects a Product object:

```typescript
product: {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;  // Optional - shows strikethrough if present
  image: string;           // Image URL
  discount?: string;       // Shows SALE badge if present
  description?: string;    // Shows below name
  rating?: number;         // 0-5, shows as stars
  reviews?: number;        // Review count in parentheses
  // ... other fields
}
```

**Special Calculations:**
- Coins = `Math.floor(price / 100)`
- Sold = Currently shows `(product.sold || 0)` - you may need to add this field to Product type if you want real sales data

---

## Animation & Transitions

```css
/* Image hover zoom */
transform: group-hover:scale-110
transition: duration-500

/* Name color change */
group-hover:text-pink-600
transition: duration-300

/* Button active press */
active:scale-95

/* General smooth transitions */
transition
hover:shadow-lg
```

---

## Testing the Card

1. **Visual Check:**
   - Heart icon visible top-left
   - SALE badge visible top-right (if discount)
   - Image fills container
   - All text readable

2. **Interaction Check:**
   - Heart icon clickable (should not navigate card)
   - Image zooms on hover
   - Color changes on hover
   - Buttons respond to clicks
   - Button press animates (scale-95)

3. **Responsive Check:**
   - Mobile: compact layout
   - Tablet+: larger image and better spacing
   - All text truncates properly

4. **Data Check:**
   - Coins calculated correctly: `price / 100`
   - Stars match rating value
   - Price formats without NaN

