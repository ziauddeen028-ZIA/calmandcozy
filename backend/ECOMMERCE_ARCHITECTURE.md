# Strapi v5 Ecommerce Architecture Guide

This guide covers the technical architecture, best practices, and integration strategies for the Calm & Cozy Ecommerce Backend powered by Strapi v5.

## 1. Data Models & Relations

### Category Hierarchy
We implement a **Scalable Category Hierarchy** using self-referencing relations:
- `parentCategory` (Many-to-One): Points up to the parent.
- `subCategories` (One-to-Many): Points down to the children.
This allows for infinite nesting (e.g., `Furniture > Chairs > Wooden Chairs`), essential for large catalogs. 

### Product Structure
- **Relations**: Products belong to a `category` (Many-to-One). This ensures each product sits exactly in one primary category, but can be queried via its parent category using advanced filtering.
- **Component**: `variants` uses a repeatable component (`ecommerce.variant`) for managing Size, Color, Stock, and Price for dynamic item variations.

## 2. Validations & Integrity

- **Slug Uniqueness**: Both `Category` and `Product` enforce unique titles/names and use Strapi's UID field for slugs. This ensures SEO-friendly URLs (`/products/wooden-chair`) that never conflict.
- **Stock Validation**: Stock levels on products and variants are strictly typed as `integer` with a `min: 0` constraint to prevent negative inventory.
- **Price Precision**: `actualPrice` and `sellingPrice` use `decimal` types. **PostgreSQL** handles decimal types perfectly for financial accuracy without floating-point errors.

## 3. Best Practices & Recommendations

### Indexing Strategy (PostgreSQL)
For production performance with PostgreSQL, ensure database indexes are created on frequently queried fields. You can do this by customizing your database lifecycle hooks or using Knex.js migrations:
- **Indexes to add**: `products.slug`, `categories.slug`, `products.category_id`.
- Strapi v5 automatically indexes UID fields, but explicitly verifying foreign key indexes is recommended.

### Inventory Handling
- **Real-time Deductions**: When an order is placed, use Strapi's entity service in a custom controller/lifecycle hook (`afterCreate` on Order) to atomically decrement the `stock` integer to prevent race conditions.
- **Variant vs Product Stock**: If a product has variants, the master `product.stock` should act as an aggregate or be disabled in favor of variant-level stock checks during checkout.

### Media & Image Optimization (Cloudinary)
- **Cloudinary Integration**: Install `@strapi/provider-upload-cloudinary`.
- Enable responsive formats. Cloudinary will automatically serve WebP/AVIF formats.
- Set `multiple: false` for Category `image` and `multiple: true` for Product `images`.
- **Frontend**: In React/Next.js, use the Cloudinary URL with the `next/image` component for lazy loading and automatic resizing.

## 4. API Usage & Populate Queries

Strapi v5 introduces the Document Service API. Here are examples of how to query your ecommerce data.

### Sample REST API Calls (React/Next.js Frontend)

#### Fetch all active products with categories and images
```javascript
// GET /api/products?populate=*
const response = await fetch('http://localhost:1337/api/products?' + new URLSearchParams({
  'populate[images][fields][0]': 'url',
  'populate[images][fields][1]': 'alternativeText',
  'populate[category][fields][0]': 'name',
  'populate[category][fields][1]': 'slug',
  'populate[variants][populate]': '*',
  'filters[stock][$gt]': 0 // Only fetch in-stock products
}));
const data = await response.json();
```

#### Fetch a single product by Slug
```javascript
// GET /api/products?filters[slug][$eq]=wooden-chair&populate=*
const fetchProduct = async (slug) => {
  const query = qs.stringify({
    filters: { slug: { $eq: slug } },
    populate: ['images', 'category', 'variants']
  });
  return await fetch(`/api/products?${query}`);
}
```

#### Fetch Category Tree (Nested)
To fetch categories and their subcategories:
```javascript
const query = qs.stringify({
  populate: {
    subCategories: {
      populate: '*'
    },
    image: true
  },
  filters: {
    parentCategory: {
      id: {
        $null: true // Fetch root categories only
      }
    }
  }
});
// GET /api/categories?${query}
```

## 5. Sample Data Structure

When you create a Product, the JSON payload looks like this:

```json
{
  "data": {
    "title": "Ergonomic Office Chair",
    "slug": "ergonomic-office-chair",
    "description": "Comfortable chair for long hours.",
    "actualPrice": 250.00,
    "sellingPrice": 199.99,
    "stock": 50,
    "featured": true,
    "images": [1, 2], // Array of media IDs
    "category": 3, // Category ID
    "variants": [
      {
        "size": "Standard",
        "color": "Black",
        "stock": 30,
        "price": 199.99
      },
      {
        "size": "Standard",
        "color": "Grey",
        "stock": 20,
        "price": 199.99
      }
    ]
  }
}
```
