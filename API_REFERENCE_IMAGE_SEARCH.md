# Image Search API Documentation

## Base URL
```
http://localhost:8000/api/image-search
```

---

## Endpoints

### 1. Upload Image

**Endpoint:** `POST /upload`

**Description:** Upload an image file or download from URL for processing.

**Request:**
```bash
curl -X POST http://localhost:8000/api/image-search/upload \
  -F "image=@photo.jpg" \
  -F "type=file"
```

Or with URL:
```bash
curl -X POST http://localhost:8000/api/image-search/upload \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "url=https://example.com/image.jpg&type=url"
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image | File | Conditional* | Image file (JPEG, PNG, WebP) |
| url | String | Conditional* | Direct URL to image |
| type | String | Yes | 'file' or 'url' |

*Either image OR url must be provided

**Response:**
```json
{
  "imageId": "550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "http://localhost:8000/uploads/images/550e8400.jpg",
  "size": 524288,
  "uploadedAt": "2025-12-10T10:30:45Z"
}
```

**Status Codes:**
- `200 OK` - Image uploaded successfully
- `400 Bad Request` - Invalid file type or URL
- `413 Payload Too Large` - File exceeds size limit
- `500 Internal Server Error` - Server error

**Examples:**

```javascript
// Using Fetch API
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('type', 'file');

const response = await fetch('/api/image-search/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.imageId); // Use for search
```

---

### 2. Search Similar Products

**Endpoint:** `GET /query`

**Description:** Find visually similar products based on uploaded image.

**Request:**
```bash
curl "http://localhost:8000/api/image-search/query?imageId=550e8400-e29b-41d4-a716-446655440000&topK=50"
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| imageId | String | Required | Image ID from upload response |
| topK | Integer | 50 | Number of results (max 500) |
| minStock | Integer | - | Minimum items in stock |
| maxPrice | Integer | - | Maximum price (in currency units) |
| minPrice | Integer | - | Minimum price |
| categories | String | - | Comma-separated category filter |

**Response:**
```json
[
  {
    "productId": 123,
    "name": "Wireless Headphones",
    "price": 4500,
    "image": "https://example.com/image.jpg",
    "relevancyScore": 0.95,
    "distance": 0.05,
    "category": "Audio",
    "stock": 15
  },
  {
    "productId": 456,
    "name": "Bluetooth Speaker",
    "price": 3200,
    "image": "https://example.com/image2.jpg",
    "relevancyScore": 0.87,
    "distance": 0.13,
    "category": "Audio",
    "stock": 8
  }
]
```

**Response Fields:**
- `productId`: Unique product identifier
- `name`: Product name
- `price`: Product price (in currency units)
- `image`: Product image URL
- `relevancyScore`: Similarity score (0-1, 1 = perfect match)
- `distance`: Inverse of relevance (0 = identical)
- `category`: Product category
- `stock`: Available units

**Status Codes:**
- `200 OK` - Search successful
- `400 Bad Request` - Missing imageId
- `404 Not Found` - Image not found or not ready
- `500 Internal Server Error` - Search failed

**Examples:**

```javascript
// JavaScript using Fetch
const imageId = "550e8400-e29b-41d4-a716-446655440000";
const params = new URLSearchParams({
  imageId,
  topK: '50',
  minPrice: '1000',
  maxPrice: '10000'
});

const response = await fetch(`/api/image-search/query?${params}`);
const results = await response.json();

results.forEach(product => {
  console.log(`${product.name}: ${Math.round(product.relevancyScore * 100)}% match`);
});
```

```python
# Python using Requests
import requests

params = {
    'imageId': '550e8400-e29b-41d4-a716-446655440000',
    'topK': 50,
    'minPrice': 1000,
    'maxPrice': 10000
}

response = requests.get('http://localhost:8000/api/image-search/query', params=params)
results = response.json()

for product in results:
    match_percent = round(product['relevancyScore'] * 100)
    print(f"{product['name']}: {match_percent}% match")
```

---

### 3. Index Products

**Endpoint:** `POST /index`

**Description:** Extract and store embeddings for products (admin endpoint).

**Request:**
```bash
curl -X POST http://localhost:8000/api/image-search/index \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": [1, 2, 3, 4, 5]
  }'
```

**Request Body:**
```json
{
  "productIds": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "indexed": 5,
  "failed": 0,
  "message": "5 products indexed, 0 failed"
}
```

**Status Codes:**
- `200 OK` - Indexing started/completed
- `400 Bad Request` - Invalid product IDs
- `500 Internal Server Error` - Indexing failed

**Notes:**
- Indexing runs asynchronously
- Can process 100+ products at once
- Required before products can appear in search results

**Example:**

```javascript
// Index all products on admin initialization
const productIds = products.map(p => p.id);

const response = await fetch('/api/image-search/index', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productIds })
});

const result = await response.json();
console.log(`${result.indexed} products indexed`);
```

---

### 4. Get Product Embedding

**Endpoint:** `GET /embeddings/:productId`

**Description:** Retrieve vector embedding for a specific product (for debugging).

**Request:**
```bash
curl "http://localhost:8000/api/image-search/embeddings/123"
```

**Response:**
```json
{
  "id": "prod-123",
  "productId": 123,
  "embedding": [0.234, 0.567, -0.123, ..., 0.456],
  "dimensions": 2048,
  "type": "product",
  "createdAt": "2025-12-10T09:00:00Z",
  "metadata": {
    "name": "Product Name",
    "price": 5000,
    "category": "Electronics"
  }
}
```

**Status Codes:**
- `200 OK` - Embedding found
- `404 Not Found` - Product not indexed
- `500 Internal Server Error` - Error retrieving embedding

---

### 5. Delete Image

**Endpoint:** `DELETE /images/:imageId`

**Description:** Clean up uploaded image and its embedding.

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/image-search/images/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted"
}
```

**Status Codes:**
- `200 OK` - Image deleted
- `500 Internal Server Error` - Deletion failed

**Note:** Images are automatically deleted after 24 hours.

---

### 6. Service Health

**Endpoint:** `GET /health`

**Description:** Check service status and statistics.

**Request:**
```bash
curl "http://localhost:8000/api/image-search/health"
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "indexedProducts": 2547,
  "vectorDimensions": 2048,
  "model": "ResNet-50 CNN",
  "lastUpdated": "2025-12-10T10:45:30Z"
}
```

**Status Values:**
- `healthy` - Service fully operational
- `degraded` - Service operational but with issues
- `offline` - Service unavailable

**Status Codes:**
- `200 OK` - Health check successful
- `500 Internal Server Error` - Service unavailable

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2025-12-10T10:30:45Z"
}
```

### Common Errors

**Invalid File Type**
```json
{
  "error": "Invalid file type. Accepted: image/jpeg, image/png, image/webp"
}
```

**File Too Large**
```json
{
  "error": "File size exceeds 5MB limit"
}
```

**Image Not Found**
```json
{
  "error": "Image not found or embedding not ready"
}
```

**Invalid URL**
```json
{
  "error": "Failed to download image from URL"
}
```

---

## Rate Limiting

Current rate limits (configurable):
- Upload endpoint: 100 requests/minute per IP
- Search endpoint: 1000 requests/minute per IP
- Index endpoint: 10 requests/minute per IP

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702200645
```

---

## Authentication (Optional)

When authentication is enabled, include Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/image-search/query?imageId=..."
```

---

## Response Time SLA

| Operation | Target | Max | Notes |
|-----------|--------|-----|-------|
| Upload | 2-5s | 30s | Includes embedding extraction |
| Search | <500ms | 2s | For 50 results |
| Index (per product) | 1-3s | 10s | Asynchronous |
| Health | <100ms | 1s | Lightweight check |

---

## Batch Operations

### Bulk Indexing Example

```javascript
async function indexAllProducts(products) {
  const batchSize = 100;
  const total = products.length;
  
  for (let i = 0; i < total; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const ids = batch.map(p => p.id);
    
    try {
      const response = await fetch('/api/image-search/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ids })
      });
      
      const result = await response.json();
      console.log(`Indexed ${i + batchSize}/${total}`);
    } catch (error) {
      console.error(`Batch ${i}-${i + batchSize} failed:`, error);
    }
  }
}
```

---

## WebSocket Support (Optional Enhancement)

For real-time progress tracking during indexing:

```javascript
const ws = new WebSocket('ws://localhost:8000/api/image-search/progress');

ws.onmessage = (event) => {
  const { indexed, total, status } = JSON.parse(event.data);
  console.log(`Progress: ${indexed}/${total}`);
};
```

---

## Example Integration Code

### Complete Search Flow

```javascript
class ImageSearchClient {
  constructor(apiUrl = 'http://localhost:8000/api/image-search') {
    this.apiUrl = apiUrl;
  }

  // Step 1: Upload image
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'file');

    const response = await fetch(`${this.apiUrl}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
  }

  // Step 2: Search for similar products
  async searchSimilar(imageId, options = {}) {
    const params = new URLSearchParams({
      imageId,
      topK: options.topK || 50,
      ...(options.minPrice && { minPrice: options.minPrice }),
      ...(options.maxPrice && { maxPrice: options.maxPrice }),
      ...(options.categories && { categories: options.categories.join(',') })
    });

    const response = await fetch(`${this.apiUrl}/query?${params}`);
    
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  }

  // Step 3: Cleanup
  async deleteImage(imageId) {
    const response = await fetch(`${this.apiUrl}/images/${imageId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Deletion failed');
    return await response.json();
  }

  // Check service health
  async getHealth() {
    const response = await fetch(`${this.apiUrl}/health`);
    return await response.json();
  }
}

// Usage
const client = new ImageSearchClient();

// User uploads image
const uploadResult = await client.uploadImage(userFile);

// Search for similar products
const results = await client.searchSimilar(uploadResult.imageId, {
  topK: 50,
  minPrice: 1000,
  maxPrice: 10000,
  categories: ['Electronics', 'Accessories']
});

// Display results
results.forEach(product => {
  console.log(`${product.name}: ${product.relevancyScore * 100}% match`);
});

// Cleanup
await client.deleteImage(uploadResult.imageId);
```

---

## API Changelog

### Version 1.0.0 (Current)
- Initial release
- Core endpoints: upload, query, index, health
- Support for JPEG, PNG, WebP
- In-memory vector store
- Basic filtering and sorting

---

## Support & Feedback

For API issues or questions:
- Check error message for specific issue
- Review examples in this documentation
- Enable debug mode in configuration
- Check service health endpoint

---

**Last Updated**: December 10, 2025
**API Version**: 1.0.0
**Status**: Stable ✅
