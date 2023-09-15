import express, { Request, Response } from 'express';
import { LocationController } from '../controllers/location.controller';
const router = express.Router();

router.post("/locations", LocationController.getLocations); // reimplemented call in frontend

export const LocationRoute = router;
