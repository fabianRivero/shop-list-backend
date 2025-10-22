import express from 'express';
import { getDailyRegister, getDayRegister, createPurchase, updatePurchase, deletePurchase, getPurchases } from '../controllers/purchaseController.js';
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", [auth], getDailyRegister);

router.get("/filters", [auth], getPurchases);

router.get("/day/:date", [auth], getDayRegister);

router.post('/', [auth], createPurchase);

router.put('/:date', [auth], updatePurchase);

router.delete('/:date', [auth], deletePurchase);

export default router;
