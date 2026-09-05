import express, { Request, Response } from "express";
import { OrderController } from "./controllers/OrderController";
import { ThirdPartyPaymentService } from "./services/PaymentService";
import { ThirdPartyEmailService } from "./services/EmailService";

const app = express();
app.use(express.json());

// Real implementations wired in here. Tests construct OrderController
// with fakes/stubs/mocks instead.
const orderController = new OrderController(
  new ThirdPartyPaymentService(),
  new ThirdPartyEmailService()
);

app.post("/orders", async (req: Request, res: Response) => {
  const { itemId, quantity, email } = req.body ?? {};

  if (typeof itemId !== "string" || typeof quantity !== "number" || typeof email !== "string") {
    return res.status(400).json({
      error: "itemId (string), quantity (number) and email (string) are required",
    });
  }

  const result = await orderController.createOrder({ itemId, quantity, email });

  switch (result.status) {
    case "success":
      return res.status(201).json({ orderId: result.orderId, transactionId: result.transactionId });
    case "payment_failed":
      return res.status(402).json({ error: "Payment failed" });
    case "invalid_item":
      return res.status(400).json({ error: `Unknown itemId: ${itemId}` });
  }
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`order-service listening on http://localhost:${PORT}`);
});
