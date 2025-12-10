# Image Search - Quick Start Guide

## 🚀 Quick Implementation (15 minutes)

### Step 1: Install Dependencies

```bash
# Frontend
npm install lucide-react react-hot-toast

# Backend
npm install @tensorflow/tfjs @tensorflow-models/mobilenet multer uuid axios
npm install --save-dev @types/multer @types/uuid
```

### Step 2: Copy Files

Copy these files to your project:

**Frontend Components:**
```
components/
  ├── ImageSearch.tsx
  └── ImageSearchResults.tsx

pages/
  └── StoreImageSearch.tsx

services/
  └── ImageSearchService.ts

config/
  └── imageSearchConfig.ts
```

**Backend:**
```
backend/src/routes/
  └── imageSearch.ts

backend/src/services/
  └── ImageSearchService.ts
```

### Step 3: Register Routes

**`backend/src/index.ts`:**
```typescript
import imageSearchRoutes from './routes/imageSearch';

// ... other setup code ...

app.use('/api/image-search', imageSearchRoutes);
```

### Step 4: Add to Frontend Routing

**`App.tsx`:**
```typescript
import { lazy } from 'react';

const StoreImageSearch = lazy(() => import('./pages/StoreImageSearch'));

// In your route handler:
case 'image-search':
  return (
    <Suspense fallback={<AppSkeleton />}>
      <StoreImageSearch 
        products={products}
        websiteConfig={websiteConfig}
        user={user}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
      />
    </Suspense>
  );
```

### Step 5: Add Navigation Link

**`components/StoreHeader.tsx`** (or your header component):
```tsx
// Add to navigation menu
<NavLink 
  onClick={() => onNavigate?.('image-search')}
  className="flex items-center gap-2"
>
  <ImageIcon size={20} />
  Search by Image
</NavLink>

// Or add as icon button in search bar
<button
  onClick={() => onNavigate?.('image-search')}
  className="p-2 hover:bg-gray-100 rounded-lg"
  title="Search by image"
>
  <ImageIcon size={20} />
</button>
```

### Step 6: Create Upload Directory

```bash
mkdir -p uploads/images
```

### Step 7: Test

1. Start backend server
2. Start frontend dev server
3. Navigate to image search page
4. Upload an image
5. See results!

---

## 📋 Features Overview

### For Users
- ✅ Upload image from device
- ✅ Paste image URL from social media
- ✅ See visually similar products
- ✅ Filter by price, category
- ✅ Sort by relevance, price
- ✅ Add to cart directly

### For Admins
- ✅ Monitor search analytics
- ✅ Index products for search
- ✅ Configure similarity thresholds
- ✅ Health check dashboard

---

## 🔧 Configuration

Edit `config/imageSearchConfig.ts` to customize:

```typescript
// Max upload size
upload: {
  maxFileSize: 5 * 1024 * 1024, // 5MB
}

// Search results
search: {
  defaultTopK: 50, // Return top 50 results
  minSimilarityScore: 0.3,
}

// UI
ui: {
  showRelevanceScore: true,
  gridColumns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  }
}
```

---

## 💻 API Endpoints

### Upload Image
```bash
curl -X POST http://localhost:8000/api/image-search/upload \
  -F "image=@photo.jpg" \
  -F "type=file"
```

### Search Similar Products
```bash
curl "http://localhost:8000/api/image-search/query?imageId=UUID&topK=50"
```

### Index Products
```bash
curl -X POST http://localhost:8000/api/image-search/index \
  -H "Content-Type: application/json" \
  -d '{"productIds": [1, 2, 3]}'
```

### Health Check
```bash
curl http://localhost:8000/api/image-search/health
```

---

## 🎯 What Happens Behind the Scenes

1. **User uploads image** → Stored temporarily in `uploads/images/`
2. **Feature extraction** → MobileNet CNN extracts 2048-dimensional vector
3. **Vector storage** → Embedding stored in vector database
4. **Similarity search** → k-NN algorithm finds 50 most similar products
5. **Filtering** → Apply price/category filters
6. **Sorting** → Sort by relevance score
7. **Results displayed** → Show in grid with relevancy badges

---

## 🚨 Troubleshooting

### "Module not found: @tensorflow/tfjs"
**Solution:** Run `npm install @tensorflow/tfjs @tensorflow-models/mobilenet`

### Upload fails with 413 error
**Solution:** Increase `maxFileSize` in config or ensure user's image is <5MB

### "No results found"
**Solution:** Products need to be indexed first. Run the index endpoint with product IDs.

### Slow search response
**Solution:** 
- Reduce `topK` parameter
- Enable caching in config
- Use vector database instead of in-memory store

---

## 📈 Next Steps

1. **Analytics Dashboard**: Track which images lead to purchases
2. **Vector Database**: Switch from in-memory to Pinecone/Milvus for scale
3. **Mobile Integration**: Add camera capture for mobile app
4. **Advanced Filters**: Extract color, material, style from images
5. **Recommendations**: Add image search to product detail page

---

## 📚 Full Documentation

See `docs/IMAGE_SEARCH_IMPLEMENTATION.md` for complete documentation.

---

## ✅ Checklist for Go-Live

- [ ] Dependencies installed
- [ ] Files copied to correct locations
- [ ] Routes registered in backend
- [ ] Routes added to frontend
- [ ] Upload directory created
- [ ] Configuration reviewed
- [ ] Tested on desktop browser
- [ ] Tested on mobile browser
- [ ] Performance acceptable (<5s searches)
- [ ] Error handling tested
- [ ] Analytics enabled

---

**Need help?** Check the troubleshooting section or review the full implementation guide.
