import express from "express";
import auth from "../middlewares/auth.js";
import { createItem, deleteItem, getItem, getitems } from "../controllers/pendingController.js";

const router = express.Router();

router.get("/", [auth], getitems);

router.get("/:id", [auth], getItem);

router.post("/", [auth], createItem);

router.delete("/:id", [auth], deleteItem);

export default router;
