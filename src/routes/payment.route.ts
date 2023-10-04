import express, { Request, Response } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { Auth } from '../controllers/middleware.controller';
const router = express.Router();

router.post("/checkout", PaymentController.checkout); // reimplemented call in frontend
router.post("/status", PaymentController.getPaymentStatus); // Not used
router.post("/createwebhook", PaymentController.createWebhook); // Not used
router.post("/getwebhooks", PaymentController.getWebhooks); // Not used
router.post("/statuswebhook", PaymentController.statusWebhook); // Not used
router.post("/book", PaymentController.addBooking); // reimplemented call in frontend
router.post("/getbook", PaymentController.getBooking); // used by CheckoutModal in frontend
router.post("/getbooks", Auth.verifyToken, PaymentController.getBookings); // reimplemented call in frontend
router.post("/delbook", PaymentController.deleteBooking); // Not used
router.post("/getbookeddates", PaymentController.getBookedDates); // reimplemented call in frontend
router.post("/setpaid", PaymentController.setStatusPaid); // Not used
router.post("/getbookdet", Auth.verifyToken, PaymentController.getBookDetails); // reimplemented call in frontend
router.post("/setstatus", PaymentController.setStatus); // reimplemented call in frontend
router.post("/eval", PaymentController.setEvalResult); // reimplemented call in frontend
router.post("/disburse", PaymentController.disburseFund);

export const PaymentRoute = router;
