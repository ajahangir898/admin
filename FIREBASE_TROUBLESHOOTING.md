# Firebase Troubleshooting Guide

## Quick Diagnostics

Run this in your browser console to test Firebase connectivity:

```javascript
// Test connection
await firebaseDebug.runDiagnostics()

// Or test individual functions:
await firebaseDebug.testConnection()
await firebaseDebug.testRead('products')
await firebaseDebug.testWrite('test_collection')
await firebaseDebug.testReadDoc('configurations/website_config')
```

---

## Common Firebase Issues & Fixes

### ❌ Issue: "Firebase DB not initialized"
**Cause:** Firebase configuration is missing or invalid credentials

**Fix:**
1. Check `services/firebaseConfig.ts` has valid API keys
2. Verify the project ID in Firebase Console matches `firebaseConfig.ts`
3. Ensure Firebase project is active (not deleted)

```typescript
// services/firebaseConfig.ts should have valid credentials:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

### ❌ Issue: "PERMISSION_DENIED" errors on read/write
**Cause:** Firestore Security Rules deny access

**Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Firestore Database
3. Go to "Rules" tab
4. Set rules to allow read/write (for development):

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes (DEVELOPMENT ONLY - NOT SECURE)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING:** This rule is insecure for production. Use proper authentication once testing is complete.

---

### ❌ Issue: Data not persisting (write appears to work but data is gone on reload)
**Cause:** Write operation not actually completing to Firebase

**Possible causes:**
1. Firestore rules don't allow writes
2. Network connectivity issues
3. Firebase quota exceeded
4. Invalid data structure

**Debug steps:**
```javascript
// Check localStorage has cached data
localStorage.getItem('gadgetshob_products')
localStorage.getItem('gadgetshob_website_config')

// Test write directly
await firebaseDebug.testWrite('test_writes')

// Check browser network tab (F12 → Network) for firestore.googleapis.com requests
```

---

### ❌ Issue: "NOT_FOUND" errors
**Cause:** Firestore collection/document doesn't exist

**Fix:**
1. Collections are auto-created when you add data
2. Check if data is in correct path:
   - Products: `products/{id}`
   - Configs: `configurations/{key}` (e.g., `configurations/website_config`)
   - Orders: `orders/{id}`

**Manual creation:**
1. Firebase Console → Firestore Database → "+ Start Collection"
2. Enter collection name and add sample documents

---

### ❌ Issue: "Network error" or request timeouts
**Cause:** Firebase service unreachable

**Debug:**
1. Check internet connection
2. Verify no firewall/proxy blocking firestore.googleapis.com
3. Check Firebase status: https://status.firebase.google.com
4. Try restarting the app (may be a transient network issue)

---

### ❌ Issue: Data shows locally but not syncing to Firebase
**Cause:** App is falling back to localStorage instead of Firebase

**This is actually OK!** The app is designed to:
1. Try Firebase first (if connected)
2. Fall back to localStorage if Firebase fails
3. Try to sync on next load

**To force Firebase sync:**
1. Clear localStorage: `localStorage.clear()`
2. Reload the page
3. If data appears again, it means Firebase has the data
4. Check browser console for errors

---

## Firestore Collection Structure

Your app expects these collections/documents:

```
firestore
├── products/          (collection)
│   ├── 1/
│   ├── 2/
│   └── ...
├── orders/            (collection)
│   ├── order1/
│   └── ...
├── users/             (collection)
│   ├── user@email.com/
│   └── ...
├── roles/             (collection)
│   ├── manager/
│   └── ...
├── configurations/    (collection)
│   ├── website_config/  (document with WebsiteConfig fields)
│   ├── theme/           (document with ThemeConfig fields)
│   ├── logo/            (document with logo URL string)
│   ├── delivery_config/ (document with DeliveryConfig array)
│   └── courier/         (document with apiKey, secretKey)
├── categories/        (collection)
├── subcategories/     (collection)
├── childcategories/   (collection)
├── brands/            (collection)
└── tags/              (collection)
```

---

## Step-by-Step Setup for Fresh Firebase Project

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Create new project
   - Enable Firestore Database (Start in test mode)

2. **Get Credentials:**
   - Project Settings → Web app config
   - Copy the config object
   - Paste into `services/firebaseConfig.ts`

3. **Enable Firestore Rules (for dev):**
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

4. **Create Collections & Sample Data:**
   - Products collection: Add sample product documents
   - Configurations collection: Add `website_config` doc with required fields
   - Run the app - it should auto-create other collections as you use them

5. **Test in Browser:**
   ```javascript
   await firebaseDebug.runDiagnostics()
   ```
   Should show all green ✓

---

## Checking Firestore in Browser DevTools

1. Open DevTools (F12)
2. Go to Application tab → Storage → IndexedDB
3. Find `firebaseLocalStorageDb` - this shows cached Firestore data
4. Go to Network tab and look for `firestore.googleapis.com` requests
5. Console should show debug logs starting with `✓ Firebase:` or `⚠ Firebase`

---

## Common Firestore Data Structures

### Product
```typescript
{
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: string;
  tag?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  brand?: string;
}
```

### WebsiteConfig
```typescript
{
  websiteName: string;
  shortDescription: string;
  whatsappNumber: string;
  addresses: string[];
  emails: string[];
  phones: string[];
  socialLinks: Array<{id: string; platform: string; url: string}>;
  showMobileHeaderCategory: boolean;
  showNewsSlider: boolean;
  headerSliderText: string;
  carouselItems: Array<{id: string; name: string; image: string; url: string; ...}>;
  productCardStyle: string;
}
```

---

## Performance Tips

1. **Firestore has a timeout of ~6 seconds** - if slower, falls back to localStorage
2. **Initial load is slow?** Make sure you're on a fast network or enable offline persistence
3. **Too many reads/writes?** Firestore charges per operation - consider batching

---

## Getting Help

If issues persist:

1. Run `firebaseDebug.runDiagnostics()` in console and share output
2. Check browser console for detailed error messages
3. Verify Firebase project credentials are correct
4. Check [Firebase Documentation](https://firebase.google.com/docs/firestore)
5. Verify Firestore Security Rules allow your operations

