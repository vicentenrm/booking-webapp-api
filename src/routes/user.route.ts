import express, { Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
const router = express.Router();

router.post("/login", UserController.login); //reimplemented call in frontend
router.post("/reqchangepass", UserController.requestChangePass);

export const UserRoute = router;
