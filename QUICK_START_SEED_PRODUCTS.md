# Quick Start: Seed 30 Products for faisal.systrmnextit.com

## TL;DR - Just Run This Command

If you have MongoDB running locally and want to quickly seed products:

```bash
cd backend
node src/scripts/seedProductsStandalone.js
```

That's it! The script will:
1. Connect to your MongoDB database
2. Find or use the tenant ID for faisal.systrmnextit.com
3. Insert 30 diverse products across 8 categories
4. Display a success message with product breakdown

## What You Get

**30 Products** across these categories:
- Electronics (5): Headphones, Smart Watch, Power Bank, USB Hub, Gaming Mouse
- Fashion (7): T-Shirts, Dresses, Wallets, Sunglasses, Sneakers, Handbags, Formal Shirts
- Home & Living (6): Mugs, Lamps, Bed Sheets, Clocks, Cookware, Cushions
- Sports & Outdoors (4): Yoga Mat, Dumbbells, Backpack, Water Bottle
- Beauty & Health (3): Skincare Set, Electric Toothbrush, Fitness Tracker
- Books & Stationery (2): Notebooks, Art Supplies
- Toys & Games (2): Building Blocks, Board Games
- Food & Beverages (1): Green Tea

Each product has:
- ✅ Name, SKU, and unique ID
- ✅ Pricing (regular, original, cost price)
- ✅ High-quality images from Unsplash
- ✅ Categories, brands, and tags
- ✅ Detailed descriptions
- ✅ Stock levels
- ✅ Ratings and reviews
- ✅ Variants (colors/sizes where applicable)

## Customization

Want to modify the products? Edit these files:
- `backend/src/scripts/seedProductsStandalone.js` (JavaScript - easier)
- `backend/src/scripts/seedProducts.ts` (TypeScript - type-safe)

Then re-run the script to update the database.

## Troubleshooting

**Can't connect to MongoDB?**
- Make sure MongoDB is running
- Check your .env file has the correct MONGODB_URI

**Tenant not found?**
- The script will still work, using "faisal.systrmnextit.com" as the tenant ID
- You can create the tenant later or modify the script to use an existing tenant ID

**Need help?**
See the full documentation: `backend/SEED_PRODUCTS_README.md`
