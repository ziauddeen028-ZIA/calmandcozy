# Order System Architecture

This guide details the robust, production-ready Order Architecture implemented in the Strapi v5 backend, engineered for complete security, strict data validation, and seamless integration with payment gateways like Stripe or Razorpay.

## 1. Security First Design

To prevent malicious users from tampering with prices on the frontend (e.g., changing `$100` to `$1` before checkout), our architecture strictly enforces **Server-Side Price Validation**.

### Lifecycle Hook Flow (`beforeCreate`)
1. Receives incoming JSON payload containing `products`.
2. Automatically generates a unique, secure `orderId` (`ORD-TIMESTAMP-HEX`).
3. Queries PostgreSQL for each `productId` securely via the backend.
4. Checks true inventory limits to ensure `item.quantity` does not exceed actual `product.stock` or `variant.stock`.
5. Strictly recalculates `subtotal` and `total` using the **database prices**.
6. Overrides the manipulated frontend payload before saving it to the database.

## 2. Inventory Management

Inventory deductions are handled via the `afterUpdate` lifecycle hook. 

- **Stock is NEVER reduced during `beforeCreate`**. This prevents "pending" or abandoned carts from draining inventory.
- Once the webhook endpoint receives a `success` status from Stripe/Razorpay, it updates the `paymentStatus` to `paid`.
- The `afterUpdate` hook listens for this exact transition. It iterates through the purchased items and atomically deducts the stock from either the master product or the specific variant.
- A `stockDeducted` boolean flag is flipped to `true` to ensure repeated webhook retries do not drain stock twice.

## 3. Webhook Integration (Stripe & Razorpay)

We have provided a custom, webhook-ready controller route: `POST /api/orders/verify-payment`.

### Implementation Steps
1. Frontend charges the customer via Razorpay/Stripe checkout.
2. The payment gateway hits `/api/orders/verify-payment` with a success payload.
3. The controller verifies the webhook signature (uncomment the signature code block for production!).
4. The controller finds the specific order using the `orderId` passed in the metadata.
5. The controller updates the `paymentStatus` to `paid`, storing the `transactionId`.
6. Stock is successfully reduced.

## 4. API Usage Examples

### Create a New Order

**POST** `/api/orders`

**Payload:**
```json
{
  "data": {
    "userName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "shippingAddress": {
      "line1": "123 Main St",
      "city": "New York",
      "zip": "10001",
      "country": "US"
    },
    "paymentMethod": "stripe",
    "total": 0, // This is safely ignored; the backend recalculates this
    "products": [
      {
        "productId": "document_id_of_the_product_here",
        "title": "Ergonomic Chair",
        "variant": {
          "size": "Standard",
          "color": "Black"
        },
        "quantity": 2,
        "price": 0, // Ignored; verified strictly against backend
        "subtotal": 0 // Ignored; recalculated by backend
      }
    ]
  }
}
```

### Webhook Verification

**POST** `/api/orders/verify-payment`

**Payload:**
```json
{
  "orderId": "ORD-16839401923-A1B2C3",
  "transactionId": "ch_3MvY82LkdIwHu7ix1gK5r2Q",
  "status": "success"
}
```

This updates the `paymentStatus` and automatically triggers stock deductions!
