# Image Search (Visual Search) Implementation Guide

## Overview
This document describes the complete Image Search (Visual Search) feature implementation for the e-commerce platform. The feature allows users to upload images or paste image URLs to find visually similar products in the catalog.

---

## Architecture Overview

### Frontend Stack
- **ImageSearch Component**: React component for image upload/URL input
- **ImageSearchResults Component**: Results page with filtering and sorting
- **StoreImageSearch Page**: Dedicated page for image search feature
- **ImageSearchService**: TypeScript service for API communication

### Backend Stack
- **Express Routes**: `/api/image-search/*` endpoints
- **ImageSearchService**: Feature extraction and embedding management
- **TensorFlow.js**: MobileNet CNN for feature extraction
- **Vector Store**: In-memory embedding storage (scalable to Pinecone/Milvus)

---

## Frontend Implementation

### 1. ImageSearch Component (`components/ImageSearch.tsx`)

**Features:**
- Drag-and-drop file upload
- Image URL input
- Client-side validation (file type, size)
- Preview of selected image
- Loading state with spinner

**Usage:**
```tsx
import { ImageSearch } from '@/components/ImageSearch';
import { imageSearchService } from '@/services/ImageSearchService';

<ImageSearch
  onSearch={async (imageId, imageUrl) => {
    return await imageSearchService.searchByImageUrl(imageUrl);
  }}
  onResultsReceived={(results) => {
    // Handle results
  }}
  variant="full"
/>
```

**Props:**
```tsx
interface ImageSearchProps {
  onSearch: (imageId: string, imageUrl: string) => Promise<ImageSearchResult>;
  onResultsReceived?: (results: ImageSearchResult) => void;
  config?: Partial<ImageSearchConfig>;
  variant?: 'minimal' | 'full';
}
```

**Variants:**
- `minimal`: Icon button in header (for main search bar)
- `full`: Full page component with tabs and detailed upload area

### 2. ImageSearchResults Component (`components/ImageSearchResults.tsx`)

**Features:**
- Display search image thumbnail
- Grid layout for product results
- Filtering by:
  - Price range (slider)
  - Category (multi-select)
  - Stock availability
- Sorting options:
  - Best Match (relevance score)
  - Price (ascending/descending)
  - Newest products
- Relevancy score badge on each product
- Add to cart and wishlist buttons
- Responsive design (mobile-first)

**Usage:**
```tsx
<ImageSearchResults
  uploadedImage={imageUrl}
  searchResults={results}
  onProductClick={(productId) => {}}
  onAddToCart={(productId) => {}}
  allProducts={products}
/>
```

### 3. StoreImageSearch Page (`pages/StoreImageSearch.tsx`)

**Features:**
- Full page dedicated to image search
- Search + Results view with toggle
- Integration with existing store components (header, footer)
- How-to guide with visual steps
- Benefits section

**Integration:**
Add to `App.tsx` routing:
```tsx
const StoreImageSearch = lazy(() => import('./pages/StoreImageSearch'));

// In route handler:
case 'image-search':
  return <StoreImageSearch products={products} {...props} />;
```

### 4. ImageSearchService (`services/ImageSearchService.ts`)

**API Methods:**

```typescript
// Upload image file
await imageSearchService.uploadImage({
  file: imageFile
});

// Search by image URL
const results = await imageSearchService.searchByImageUrl(
  'https://...',
  {
    topK: 50,
    filters: { minPrice: 100, maxPrice: 5000 }
  }
);

// Search by uploaded file
const results = await imageSearchService.searchByImageFile(
  imageFile,
  options
);

// Index products
await imageSearchService.indexProductEmbeddings([1, 2, 3]);

// Check service health
const status = await imageSearchService.getServiceStatus();
```

---

## Backend Implementation

### 1. Image Search Routes (`backend/src/routes/imageSearch.ts`)

**Endpoints:**

#### `POST /api/image-search/upload`
- Accept image file or URL
- Validate file type and size
- Store image temporarily
- Extract embeddings asynchronously
- Return image ID and URL

**Request:**
```json
{
  "type": "file" | "url",
  "image": <File>,
  "url": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "imageId": "uuid",
  "imageUrl": "https://api.example.com/uploads/images/uuid.jpg",
  "size": 1024000,
  "uploadedAt": "2025-12-10T10:00:00Z"
}
```

#### `GET /api/image-search/query?imageId=UUID&topK=50&filters=...`
- Query uploaded image against product catalog
- Return top K most similar products
- Apply filtering (price, category, stock)
- Return JSON array with relevancy scores

**Response:**
```json
[
  {
    "productId": 123,
    "name": "Product Name",
    "price": 5000,
    "image": "https://...",
    "relevancyScore": 0.95,
    "category": "Electronics",
    "stock": 10
  }
]
```

#### `POST /api/image-search/index`
- Bulk index products with embeddings
- Admin endpoint
- Async processing
- Return indexing statistics

**Request:**
```json
{
  "productIds": [1, 2, 3, ...]
}
```

#### `GET /api/image-search/health`
- Service status and statistics
- Returns indexed product count
- Model version information

### 2. ImageSearchService (`backend/src/services/ImageSearchService.ts`)

**Key Features:**

**Vector Extraction:**
```typescript
// Uses MobileNet (ResNet-50 based) for 2048-dimensional embeddings
const embedding = await service.extractEmbedding(imageUrl);
// Returns: number[] (2048 dimensions)
```

**Similarity Search (k-NN):**
```typescript
// Cosine similarity calculation
const similarity = cosineSimilarity(queryVector, productVector);
// Range: [-1, 1], where 1 = identical

// Find top K matches
const results = await service.findSimilarProducts(
  queryEmbedding,
  k = 50,
  filters
);
```

**In-Memory Vector Store:**
```typescript
class VectorStore {
  store(id, embedding);
  get(id);
  getByProductId(productId);
  delete(id);
  getAllProductEmbeddings();
}
```

**Product Registration:**
```typescript
ImageSearchService.registerProducts([
  {
    id: 1,
    name: 'Product 1',
    price: 5000,
    image: 'https://...',
    category: 'Electronics',
    stock: 10
  }
]);
```

---

## Installation & Setup

### Frontend Dependencies

```bash
npm install lucide-react react-hot-toast
```

### Backend Dependencies

```bash
npm install @tensorflow/tfjs @tensorflow-models/mobilenet multer uuid axios
npm install --save-dev @types/multer @types/uuid
```

### Environment Variables

**.env (Frontend)**
```
REACT_APP_API_URL=http://localhost:8000
```

**.env (Backend)**
```
API_BASE_URL=http://localhost:8000
UPLOAD_DIR=./uploads/images
VECTOR_DB_TYPE=memory # or 'pinecone', 'milvus'
```

### Multer Configuration

Create `uploads/images` directory:
```bash
mkdir -p uploads/images
```

---

## Integration Checklist

### Frontend Integration

- [ ] Copy `ImageSearch.tsx` to `components/`
- [ ] Copy `ImageSearchResults.tsx` to `components/`
- [ ] Copy `StoreImageSearch.tsx` to `pages/`
- [ ] Copy `ImageSearchService.ts` to `services/`
- [ ] Add route to `App.tsx`
- [ ] Add image search icon to header (minimal variant)
- [ ] Test all image upload methods
- [ ] Test filtering and sorting
- [ ] Verify responsive design on mobile

### Backend Integration

- [ ] Copy `imageSearch.ts` to `backend/src/routes/`
- [ ] Copy `ImageSearchService.ts` to `backend/src/services/`
- [ ] Register route in `backend/src/index.ts`:
  ```typescript
  import imageSearchRoutes from './routes/imageSearch';
  app.use('/api/image-search', imageSearchRoutes);
  ```
- [ ] Install dependencies
- [ ] Test upload endpoint
- [ ] Test search endpoint
- [ ] Test health check
- [ ] Configure multer upload directory
- [ ] Add error handling middleware

### Testing Checklist

- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Paste image URL
- [ ] Verify file size validation
- [ ] Verify file type validation
- [ ] Search returns results
- [ ] Filter by price works
- [ ] Filter by category works
- [ ] Sort by relevance works
- [ ] Add to cart from results
- [ ] Product click navigates correctly

---

## Performance Optimization

### Frontend

1. **Lazy Loading**: ImageSearch components are lazy-loaded
2. **Image Compression**: Client-side validation prevents large uploads
3. **Caching**: Service caches embeddings for repeated searches
4. **Debouncing**: Filter changes debounced to prevent excessive API calls

### Backend

1. **Async Processing**: Embedding extraction runs asynchronously
2. **Vector Caching**: Store embeddings in memory for fast k-NN
3. **Batch Indexing**: Process multiple products in parallel
4. **Connection Pooling**: Use pooled database connections

### Production Optimizations

1. **Vector Database**: Replace in-memory store with Pinecone/Milvus
2. **CDN**: Serve uploaded images from CDN
3. **Model Caching**: Cache TensorFlow model in memory
4. **API Caching**: Cache search results with Redis
5. **Batch Processing**: Queue embedding extraction jobs

---

## Scalability Plan

### Phase 1 (Current)
- In-memory vector store
- Single server deployment
- ~10,000 products max

### Phase 2
- Redis-backed vector cache
- Separate image processing service
- Job queue for embedding extraction

### Phase 3
- Pinecone or Milvus vector database
- Distributed image processing
- Multiple search service replicas

### Phase 4
- Custom GPU service for embedding extraction
- Vector compression techniques
- Approximate nearest neighbor (ANN) for faster search

---

## Security Considerations

### Image Upload Security
- File type validation (JPEG, PNG, WebP only)
- File size limits (5MB default)
- Virus scanning (optional, requires VirusTotal API)
- Store in secure directory outside web root

### API Security
- Rate limiting on upload endpoint
- CORS configuration
- Input validation on all endpoints
- JWT authentication for admin endpoints

### Privacy
- Delete uploaded images after 24 hours
- No image retention for non-users
- GDPR compliance for EU users

---

## Error Handling

### Client-Side
```typescript
try {
  const results = await imageSearchService.searchByImageUrl(url);
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout
  } else if (error.message.includes('Invalid')) {
    // Handle validation error
  }
}
```

### Server-Side
```typescript
router.post('/upload', async (req, res) => {
  try {
    // Process upload
  } catch (error) {
    if (error instanceof MulterError) {
      res.status(413).json({ error: 'File too large' });
    } else {
      res.status(500).json({ error: 'Upload failed' });
    }
  }
});
```

---

## Future Enhancements

1. **Multi-Image Search**: Allow uploading multiple images for comparison
2. **Visual Recommendations**: Homepage carousel showing visually similar items
3. **Advanced Filters**: Color filter, material, brand from image analysis
4. **A/B Testing**: Compare keyword vs image search performance
5. **Analytics**: Track which images lead to purchases
6. **Mobile App**: Native mobile implementation with camera integration
7. **Augmented Reality**: AR try-on integration
8. **User History**: Save past searches and set up alerts

---

## Troubleshooting

### Model Not Loading
**Error**: "Model not initialized"
**Solution**: Ensure TensorFlow.js and MobileNet are installed and available

### Upload Fails
**Error**: "Upload failed: 413 Payload Too Large"
**Solution**: Increase file size limit in multer config or compress image client-side

### No Results Found
**Error**: "No similar products found"
**Solution**: Ensure products are indexed with embeddings. Run indexing endpoint.

### Slow Search
**Problem**: Search takes >5 seconds
**Solution**: 
- Reduce topK parameter
- Enable vector caching
- Use approximate nearest neighbor search

---

## References

- [TensorFlow.js Documentation](https://js.tensorflow.org/)
- [MobileNet Model](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet)
- [Pinecone Vector Database](https://www.pinecone.io/)
- [Milvus Open Source](https://milvus.io/)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)

---

## Support & Contact

For questions or issues with the Image Search implementation, contact the development team or refer to the GitHub repository.

Last Updated: December 10, 2025
Version: 1.0.0
