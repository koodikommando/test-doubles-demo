# order-service

A minimal Express + TypeScript API for placing orders. It exists to
demonstrate dependency injection: `PaymentService` and `EmailService` are
defined as interfaces and passed into `OrderController` via its constructor,
so they're easy to swap out in tests.

## Endpoint

`POST /orders`

Request body:

```json
{
  "itemId": "widget-small",
  "quantity": 2,
  "email": "customer@example.com"
}
```

Responses:

- `201` — `{ "orderId": "...", "transactionId": "..." }`
- `402` — `{ "error": "Payment failed" }`
- `400` — invalid request body or unknown `itemId`

## Running locally

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000` (override with `PORT`).
