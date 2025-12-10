# Image Search - Dependencies & Setup Guide

## Installation Commands

### Frontend Dependencies

```bash
# Install image search frontend dependencies
npm install lucide-react react-hot-toast

# Optional: For advanced image processing on client side
npm install sharp-edge   # Image compression
npm install react-dropzone  # Enhanced drag-drop
```

### Backend Dependencies

```bash
# Core dependencies for image search
npm install @tensorflow/tfjs @tensorflow-models/mobilenet
npm install multer uuid axios express
npm install --save-dev @types/multer @types/uuid @types/express

# Optional: For production vector databases
npm install pinecone-client  # For Pinecone integration
npm install milvus        # For Milvus integration
npm install redis         # For Redis caching
npm install bull          # For job queue

# Optional: For advanced features
npm install sharp         # Image optimization
npm install form-data     # Form data handling
npm install dotenv        # Environment variables
```

## package.json Updates

### Frontend (package.json)

Add these to your frontend `package.json` dependencies:

```json
{
  "dependencies": {
    "lucide-react": "^latest",
    "react-hot-toast": "^2.4.1",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0"
  }
}
```

### Backend (backend/package.json)

Add these to your backend `package.json` dependencies:

```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.11.0",
    "@tensorflow-models/mobilenet": "^2.1.0",
    "multer": "^1.4.5",
    "uuid": "^9.0.0",
    "axios": "^1.6.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/multer": "^1.4.7",
    "@types/uuid": "^9.0.0",
    "@types/express": "^4.17.0",
    "typescript": "^5.0.0"
  },
  "optionalDependencies": {
    "pinecone-client": "^3.0.0",
    "milvus": "^2.3.0",
    "redis": "^4.6.0",
    "bull": "^4.11.0",
    "sharp": "^0.33.0"
  }
}
```

## Installation Steps

### Step 1: Install Frontend Dependencies
```bash
cd /path/to/admin
npm install lucide-react react-hot-toast
```

### Step 2: Install Backend Dependencies
```bash
cd /path/to/admin/backend
npm install @tensorflow/tfjs @tensorflow-models/mobilenet multer uuid axios
npm install --save-dev @types/multer @types/uuid
```

### Step 3: Create .env Files

**Frontend (.env or .env.local):**
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_IMAGE_SEARCH_ENABLED=true
```

**Backend (.env):**
```
# Server
NODE_ENV=development
PORT=8000
API_BASE_URL=http://localhost:8000

# Image Upload
UPLOAD_DIR=./uploads/images
MAX_FILE_SIZE=5242880

# Vector Store (choose one)
VECTOR_STORE_TYPE=memory
# VECTOR_STORE_TYPE=pinecone
# PINECONE_API_KEY=your-api-key
# PINECONE_ENVIRONMENT=production

# TensorFlow
TF_CPP_MIN_LOG_LEVEL=3

# Logging
LOG_LEVEL=info
```

### Step 4: Create Upload Directory
```bash
mkdir -p uploads/images
chmod 755 uploads/images
```

### Step 5: Configure TypeScript

**tsconfig.json - Add/update:**
```json
{
  "compilerOptions": {
    "lib": ["es2020", "dom", "dom.iterable"],
    "target": "es2020",
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Verification

### Check Installation
```bash
# Frontend
npm list lucide-react react-hot-toast

# Backend
npm list @tensorflow/tfjs @tensorflow-models/mobilenet multer uuid axios
```

### Test Imports
```typescript
// Frontend
import { ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Backend
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
```

## Troubleshooting Installation

### Error: Cannot find module '@tensorflow/tfjs'

**Solution:**
```bash
npm install @tensorflow/tfjs --legacy-peer-deps
```

### Error: TensorFlow WASM binding not found

**Solution (Frontend):**
```bash
# The model will auto-load WASM if needed, but you can pre-load:
npm install @tensorflow/tfjs-backend-wasm
```

### Error: Module not found: 'multer'

**Solution:**
```bash
npm install multer --save
npm install --save-dev @types/multer
```

### Out of Memory during Installation

**Solution:**
```bash
npm install --max-old-space-size=4096
```

### Port Already in Use

**Solution:**
```bash
# Change port in .env
PORT=8001
```

## Production Setup

### Optimize TensorFlow for Production

```typescript
// In backend initialization
import * as tf from '@tensorflow/tfjs';

tf.backend('cpu'); // Use CPU backend (faster for inference)
// or
tf.backend('webgl'); // Use WebGL (if available)
```

### Install Production Dependencies

```bash
# Production vector database
npm install pinecone-client

# Production caching
npm install redis bull

# Image optimization
npm install sharp
```

### Update Environment for Production

**.env (production)**
```
NODE_ENV=production
PORT=8000
API_BASE_URL=https://api.yourdomain.com

VECTOR_STORE_TYPE=pinecone
PINECONE_API_KEY=your-production-key
PINECONE_ENVIRONMENT=production-1

REDIS_URL=redis://your-redis-instance:6379

LOG_LEVEL=warn
MAX_CONCURRENT_INDEXING_JOBS=4
```

## Dependency Size Impact

| Package | Size | Purpose |
|---------|------|---------|
| @tensorflow/tfjs | ~1.2MB | Core ML framework |
| @tensorflow-models/mobilenet | ~50KB | Model metadata |
| multer | ~50KB | File uploads |
| uuid | ~20KB | ID generation |
| axios | ~50KB | HTTP client |
| lucide-react | ~300KB | Icons |
| react-hot-toast | ~200KB | Notifications |

**Total addition:** ~2MB (uncompressed)

## Version Compatibility

| Package | Minimum | Recommended |
|---------|---------|-------------|
| Node.js | 14.0.0 | 18.0.0+ |
| npm | 6.0.0 | 9.0.0+ |
| React | 16.8.0 | 18.0.0+ |
| TypeScript | 4.0.0 | 5.0.0+ |
| TensorFlow.js | 4.0.0 | 4.11.0+ |

## Next Steps

1. ✅ Run `npm install` commands
2. ✅ Create `.env` files with configuration
3. ✅ Create upload directories
4. ✅ Copy component files to project
5. ✅ Register routes in backend
6. ✅ Test imports compile
7. ✅ Run development servers
8. ✅ Test image search functionality

## Support

If you encounter dependency issues:

1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Check Node version: `node --version`

For detailed component integration, see `QUICKSTART_IMAGE_SEARCH.md`.
