export interface PaymentService {
  charge(amount: number): Promise<{ success: boolean; transactionId: string }>;
}

/**
 * Stands in for a real payment provider integration (e.g. Stripe).
 * Structured as if it makes an HTTP call to the provider's API, but
 * everything here is simulated so the demo has no external dependency.
 */
export class ThirdPartyPaymentService implements PaymentService {
  private readonly apiUrl = "https://api.payment-provider.example/v1/charges";

  async charge(amount: number): Promise<{ success: boolean; transactionId: string }> {
    console.log(`[PaymentService] POST ${this.apiUrl} amount=${amount.toFixed(2)}`);

    // Simulate the latency of a real network call to the payment provider.
    await new Promise((resolve) => setTimeout(resolve, 100));

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[PaymentService] charge succeeded: ${transactionId}`);

    return { success: true, transactionId };
  }
}
