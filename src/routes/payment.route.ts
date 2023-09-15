import express, { Request, Response } from 'express';
import { PaymentController } from '../controllers/payment.controller';
const router = express.Router();

router.post("/checkout", PaymentController.checkout); // reimplemented call in frontend
router.post("/status", PaymentController.getPaymentStatus); // Not used
router.post("/createwebhook", PaymentController.createWebhook); // Not used
router.post("/getwebhooks", PaymentController.getWebhooks); // Not used
router.post("/statuswebhook", PaymentController.statusWebhook); // Not used
router.post("/book", PaymentController.addBooking); // reimplemented call in frontend
router.post("/getbook", PaymentController.getBooking); // used by CheckoutModal in frontend
router.post("/getbooks", PaymentController.getBookings); // reimplemented call in frontend
router.post("/delbook", PaymentController.deleteBooking); // Not used
router.post("/getbookeddates", PaymentController.getBookedDates); // reimplemented call in frontend
router.post("/setpaid", PaymentController.setStatusPaid); // Not used
router.post("/getbookdet", PaymentController.getBookDetails); // reimplemented call in frontend
router.post("/setstatus", PaymentController.setStatus); // reimplemented call in frontend
router.post("/eval", PaymentController.setEvalResult); // reimplemented call in frontend

export const PaymentRoute = router;
