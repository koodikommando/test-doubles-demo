export interface EmailService {
  sendConfirmation(email: string, orderId: string): Promise<void>;
}

/**
 * Stands in for a real transactional email provider (e.g. SendGrid).
 * Structured as if it makes an HTTP call to the provider's API, but
 * everything here is simulated so the demo has no external dependency.
 */
export class ThirdPartyEmailService implements EmailService {
  private readonly apiUrl = "https://api.email-provider.example/v1/send";

  async sendConfirmation(email: string, orderId: string): Promise<void> {
    console.log(`[EmailService] POST ${this.apiUrl} to=${email} orderId=${orderId}`);

    // Simulate the latency of a real network call to the email provider.
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`[EmailService] confirmation sent to ${email}`);
  }
}
