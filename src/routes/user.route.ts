import express, { Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
const router = express.Router();

router.post("/login", UserController.login);

export const UserRoute = router;
