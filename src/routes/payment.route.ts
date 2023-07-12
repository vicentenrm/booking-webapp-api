import express, { Request, Response } from 'express';
import { PaymentController } from '../controllers/payment.controller';
const router = express.Router();

router.post("/checkout", PaymentController.checkout);
router.post("/status", PaymentController.getPaymentStatus);

export const PaymentRoute = router;
