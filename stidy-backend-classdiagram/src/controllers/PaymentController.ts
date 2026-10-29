import { Request, Response } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/PaymentService';
import { SubscriptionService } from '../services/SubscriptionService';

const checkoutSchema = z.object({ planId: z.string().uuid() });

export class PaymentController {
  constructor(private payments: PaymentService, private subscriptions: SubscriptionService) {}

  listPlans = async (_req: Request, res: Response) => { res.json(await this.subscriptions.listPlans()); };
  checkout = async (req: Request, res: Response) => {
    res.status(201).json(await this.payments.checkout(req.user!.id, checkoutSchema.parse(req.body).planId));
  };
  listTransactions = async (req: Request, res: Response) => {
    res.json(await this.payments.listTransactions(req.user!.id));
  };
  getTransaction = async (req: Request, res: Response) => {
    res.json(await this.payments.getTransaction(req.user!.id, req.params.id));
  };
  mySubscription = async (req: Request, res: Response) => {
    const current = await this.subscriptions.getCurrent(req.user!.id);
    res.json({ isPremium: !!current, subscription: current });
  };
  /** Webhook gateway: tanpa JWT, diamankan lewat signature. */
  notification = async (req: Request, res: Response) => {
    res.json(await this.payments.handleNotification(req.body));
  };
}
