import { describe, it, expect } from 'vitest';
import { OrderController } from './OrderController';
import { PaymentService } from '../services/PaymentService';
import { EmailService } from '../services/EmailService';

describe('OrderController', ()  => {
    it('sends a confirmation email when payment succeeds', async () => {
      
        // arrange

      const paymentStub: PaymentService = {
        charge: async (amount: number) => ({
          success: true,
          transactionId: 'stub-txn-123',
        }),
      };

      const sentEmails: { email: string; orderId: string }[] = [];

      const emailStub: EmailService = {
        sendConfirmation: async (email: string, orderId: string) => {
            sentEmails.push({ email, orderId });
          },
      };
      
      // act

      const result = await new OrderController(paymentStub, emailStub)
        .createOrder({
          itemId: 'widget-small',
          quantity: 1,
          email: 'test@example.com',
        });

    
      // assert
      expect(result.status).toBe('success');

      if (result.status === 'success') {
        expect(sentEmails).toEqual([
          { email: 'test@example.com', orderId: result.orderId },
        ]);
      }
    });
  });