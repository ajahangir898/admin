# Product Seeding Guide

This guide explains how to seed 30 default products into the database for faisal.systrmnextit.com.

## Prerequisites

- MongoDB must be running and accessible
- Backend dependencies must be installed (`npm install` in the `/backend` directory)
- Proper `.env` file must be configured in the `/backend` directory

## Running the Product Seed Script

### Method 1: Using standalone JavaScript (Easiest - No TypeScript required)

```bash
cd backend
node src/scripts/seedProductsStandalone.js
```

This method works with just Node.js and doesn't require TypeScript compilation. Perfect for running directly on the server.

### Method 2: Using npm script

```bash
cd backend
npm run seed:products
```

### Method 3: Using ts-node directly

```bash
cd backend
npx ts-node src/scripts/seedProducts.ts
```

### Method 4: Using compiled JavaScript

```bash
cd backend
npm run build
node dist/scripts/seedProducts.js
```

## What Gets Seeded

The script will insert **30 diverse products** from the following categories:

1. **Electronics** (5 products)
   - Wireless Bluetooth Headphones
   - Smart Watch Pro
   - Portable Power Bank
   - USB-C Hub
   - Wireless Gaming Mouse

2. **Fashion** (7 products)
   - Men's Casual Cotton T-Shirt
   - Women's Summer Dress
   - Leather Wallet
   - Designer Sunglasses
   - Casual Sneakers
   - Women's Handbag
   - Men's Formal Shirt

3. **Home & Living** (6 products)
   - Ceramic Coffee Mug Set
   - LED Desk Lamp
   - Cotton Bed Sheet Set
   - Wall Clock
   - Non-Stick Cookware Set
   - Decorative Cushion Covers

4. **Sports & Outdoors** (4 products)
   - Yoga Mat with Bag
   - Adjustable Dumbbells Set
   - Camping Backpack
   - Sports Water Bottle

5. **Beauty & Health** (3 products)
   - Skincare Gift Set
   - Electric Toothbrush
   - Fitness Tracker Band

6. **Books & Stationery** (2 products)
   - Premium Notebook Set
   - Art Supplies Kit

7. **Toys & Games** (2 products)
   - Building Blocks Set
   - Board Game Collection

8. **Food & Beverages** (1 product)
   - Premium Green Tea Box

## Product Features

Each product includes:
- **Unique ID** and SKU
- **Name** and slug
- **Pricing**: Regular price, original price, and cost price
- **Images**: Professional product images from Unsplash
- **Categories**: Main category, subcategory, and brand
- **Tags**: Search and filter tags
- **Descriptions**: Detailed product descriptions
- **Stock levels**: Realistic inventory counts
- **Ratings & Reviews**: Sample ratings and review counts
- **Variants**: Colors and sizes where applicable
- **Status**: All products are set to "Active"

## Tenant Configuration

The script automatically:
1. Looks for a tenant with "faisal" in the subdomain
2. If found, uses that tenant's ID
3. If not found, uses "faisal.systrmnextit.com" as the tenant ID

## Important Notes

- **Existing Data**: If products already exist for the tenant, they will be **replaced** with the new seed data
- **Database**: Products are stored in the `tenant_data` collection with key `products`
- **Images**: All product images use Unsplash URLs (free, high-quality stock photos)

## Verifying the Seeded Products

After running the script, you can verify the products in several ways:

### 1. Using MongoDB Shell

```javascript
db.tenant_data.findOne({ key: "products" })
```

### 2. Using the Admin UI

Navigate to the Products page in your admin panel to see all 30 products.

### 3. Check the script output

The script will display:
- Total number of products seeded
- Breakdown by category
- Success/error messages

## Troubleshooting

### MongoDB Connection Error

If you see `ECONNREFUSED` errors:
- Ensure MongoDB is running
- Check the `MONGODB_URI` in your `.env` file
- Verify network connectivity to MongoDB

### TypeScript Compilation Errors

If you encounter TypeScript errors:
- Ensure all dependencies are installed: `npm install`
- Check that `ts-node` is available in `node_modules`

### Tenant Not Found

If the faisal tenant doesn't exist:
- The script will use "faisal.systrmnextit.com" as the tenant ID
- You may need to create the tenant first through the admin panel
- Or modify the script to use an existing tenant ID

## Customization

To modify the products, edit `/backend/src/scripts/seedProducts.ts`:
- Change product details in the `PRODUCTS` array
- Add or remove products
- Modify categories
- Update pricing or stock levels

After making changes, re-run the seed script to update the database.
