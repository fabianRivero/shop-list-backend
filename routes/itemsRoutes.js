import express from "express";
import auth from "../middlewares/auth.js";
import { createItem, deleteItem, editItem, getItem, getitems } from "../controllers/itemsController.js";

const router = express.Router();

// GET /api/items/
router.get("/", [auth], getitems);

// GET /api/items/:id
router.get("/:id", [auth], getItem);

// POST /api/items/
router.post("/", [auth], createItem);


// PUT /api/items/:id
router.put("/:id", [auth], editItem);

// DELETE /api/items/:id
router.delete("/:id", [auth], deleteItem);




export default router;
