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

## Testing Approach

`OrderController` depends on `PaymentService` and `EmailService` via
constructor injection rather than importing concrete implementations
directly. This means tests can pass in test doubles — objects that stand
in for the real payment/email integrations — so the order logic can be
exercised without making real network calls to any external provider.
All tests live in `src/controllers/OrderController.test.ts`.

### Stubs

A stub is an object that returns hardcoded data regardless of what it's
called with. It's useful when a test only cares about the data a
dependency returns, not about how or whether it was called.

Three tests use stubs:

- `sends a confirmation email when payment succeeds` — `paymentStub`
  always returns `{ success: true, ... }`.
- `does not send a confirmation email when payment fails` — `paymentStub`
  always returns `{ success: false, ... }`.
- `returns an error when the item is not found` — `paymentStub.charge`
  throws if it's ever called. Since the item is invalid, `OrderController`
  should never reach the payment step; rather than just assuming that's
  true, the stub is written so the test fails loudly if that assumption
  is ever violated.

### Mocks

A mock verifies *how* a dependency was called — call count, arguments —
rather than just returning canned data. The test
`calls the email service with the correct arguments when payment succeeds`
uses `vi.fn()` to create `emailMock`, then asserts
`toHaveBeenCalledTimes(1)` and `toHaveBeenCalledWith('test@example.com', result.orderId)`.

The earlier stub-based tests take a different approach to checking the
email call: `emailStub.sendConfirmation` pushes into a plain
`sentEmails` array, and the test asserts on the array's contents
afterward. That works, but it's hand-rolled — it blurs the line between
a stub (just returning/recording data) and a spy (tracking how it was
called). The `vi.fn()` version is the more idiomatic way to verify that
an interaction actually happened, since call count and arguments are
checked directly through the mocking library rather than reconstructed
from manually recorded state.
