import express, { Request, Response } from 'express';
import { PaymentController } from '../controllers/payment.controller';
const router = express.Router();

router.post("/checkout", PaymentController.checkout);
router.post("/status", PaymentController.getPaymentStatus);
router.post("/createwebhook", PaymentController.createWebhook);
router.post("/getwebhooks", PaymentController.getWebhooks);
router.post("/statuswebhook", PaymentController.statusWebhook);
router.post("/book", PaymentController.addBooking);
router.post("/getbook", PaymentController.getBooking);
router.post("/getbooks", PaymentController.getBookings);
router.post("/delbook", PaymentController.deleteBooking);
router.post("/getbookeddates", PaymentController.getBookedDates);
router.post("/setpaid", PaymentController.setStatusPaid);

export const PaymentRoute = router;
