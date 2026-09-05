import { describe, it, expect, vi } from 'vitest';
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

    it('does not send a confirmation email when payment fails', async () => {
        // arrange — brand new paymentStub, emailStub, sentEmails here
        const paymentStub: PaymentService = {
            charge: async (amount: number) => ({
              success: false,
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
        expect(result.status).toBe('payment_failed');
        expect(sentEmails).toEqual([]);
      });

    it('returns an error when the item is not found', async () => {
        // arrange 

        const paymentStub: PaymentService = {
            charge: async () => {
              throw new Error('paymentService.charge should never be called for an invalid item');
            },
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
          itemId: 'invalid-item',
          quantity: 1,
          email: 'test@example.com',
        });

        // assert
        expect(result.status).toBe('invalid_item');
        expect(sentEmails).toEqual([]);
    });

    it('calls the email service with the correct arguments when payment succeeds', async () => {
        // arrange
        const paymentStub: PaymentService = {
          charge: async (amount: number) => ({
            success: true,
            transactionId: 'stub-txn-123',
          }),
        };
      
        const emailMock = vi.fn(async () => {});
      
        const emailStub: EmailService = {
          sendConfirmation: emailMock,
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
          expect(emailMock).toHaveBeenCalledTimes(1);
          expect(emailMock).toHaveBeenCalledWith('test@example.com', result.orderId);
        }
      });
  });