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
- `400` — invalid request body or unknown `itemId`

Note: `OrderController` also has a `payment_failed` branch (mapped to a
`402` response), and it's tested at the unit level via a stub. It isn't
reachable through the live API today, though, since the real
`ThirdPartyPaymentService.charge()` always returns `success: true`.

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

### API Tests (Playwright)

`tests/orders.api.spec.ts` is a different layer entirely: it sends a
real HTTP request to the actual running Express server and uses the
real `ThirdPartyPaymentService` and `ThirdPartyEmailService` — no
stubs, mocks, or fakes. It exists to prove the app is wired together
correctly end to end (JSON parsing, routing, the real service calls),
not to re-check business logic already covered by the unit tests.

`playwright.config.ts` starts the dev server automatically before the
tests run (`webServer` block), so there's no need to start it by hand.

Three tests currently cover this layer:

- `POST /orders succeeds with a valid item, quantity, and email` — the
  happy path, asserting a `201` with an `orderId`/`transactionId` shape.
- `POST /orders returns 400 for an unknown itemId` — asserts the real
  route handler's validation error response for an item not in the
  catalog.
- `POST /orders returns 400 when a required field is missing` — asserts
  the real route handler's validation error response when `quantity` is
  omitted from the request body.

Run with:

```bash
npx playwright test
```

## CI

`.github/workflows/ci.yml` runs on every push and pull request. It
installs dependencies (`npm ci`), builds (`npm run build`), runs the
Vitest unit tests, then installs Playwright's browsers and runs the
Playwright API tests. If the Playwright run fails, the HTML report is
uploaded as a build artifact (kept for 7 days) for inspection.
