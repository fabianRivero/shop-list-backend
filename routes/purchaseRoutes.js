import express from 'express';
import { getDailyRegister, getDayRegister, createPurchase, updatePurchase, deletePurchase, getPurchases } from '../controllers/purchaseController.js';
import auth from "../middlewares/auth.js";

const router = express.Router();

// GET /api/purchases/
router.get("/", [auth], getDailyRegister);

// GET /api/purchases/summary?period=week&ofset=-1&sector=limpieza
router.get("/filters", [auth], getPurchases);

// GET /api/purchases/:date
router.get("/day/:date", [auth], getDayRegister);

// POST /api/purchases
router.post('/', [auth], createPurchase);

router.put('/:date', [auth], updatePurchase);

router.delete('/:date', [auth], deletePurchase);

export default router;
