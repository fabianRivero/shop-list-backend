import express from 'express';
import { getDailyRegister, getDayRegister, createPurchase, updatePurchase, deletePurchase, getSummary } from '../controllers/purchaseController.js';
import auth from "../middlewares/auth.js";

const router = express.Router();

// GET /api/purchases/
router.get("/", [auth], getDailyRegister);

// GET /api/purchases/summary?period=week/ofset=-1&sector=limpieza
router.get("/summary", [auth], getSummary);

// GET /api/purchases/:date
router.get("/day/:date", [auth], getDayRegister);

// POST /api/purchases
router.post('/', [auth], createPurchase);

router.put('/:date', [auth], updatePurchase);

router.delete('/:date', [auth], deletePurchase);

export default router;

/*
{
  "userId": "64a123abc456def789000111",
  "type": "daily" | "weekly" | "monthly",
  "date": "YYYY-MM-DD",
  "products": [
    {
      "productId": "item-001",
      "name": "Leche",
      "quantity": 1,               
      "unit": "litro",
      "purchasedQuantity": 2,      
      "price": 10,
      "currency": "BOB",
      "brand": "PIL",
      "sector": "alimentos"
    }
  ]
}

*/