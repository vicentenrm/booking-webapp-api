import express, { Request, Response } from 'express';
import { PriceController } from '../controllers/price.controller';
const router = express.Router();

router.get("/prices", PriceController.getPrices); // reimplemented call in frontend

export const PriceRoute = router;
