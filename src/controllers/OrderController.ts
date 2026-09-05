import { PaymentService } from "../services/PaymentService";
import { EmailService } from "../services/EmailService";
import { getPriceForItem } from "../data/catalog";

export interface CreateOrderRequest {
  itemId: string;
  quantity: number;
  email: string;
}

export type CreateOrderResult =
  | { status: "success"; orderId: string; transactionId: string }
  | { status: "payment_failed" }
  | { status: "invalid_item" };

/**
 * PaymentService and EmailService are injected rather than imported directly,
 * so tests can swap in fakes/stubs/mocks without touching this class.
 */
export class OrderController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService
  ) {}

  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
    const unitPrice = getPriceForItem(request.itemId);
    if (unitPrice === undefined) {
      return { status: "invalid_item" };
    }

    const total = unitPrice * request.quantity;
    const paymentResult = await this.paymentService.charge(total);

    if (!paymentResult.success) {
      return { status: "payment_failed" };
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await this.emailService.sendConfirmation(request.email, orderId);

    return { status: "success", orderId, transactionId: paymentResult.transactionId };
  }
}
