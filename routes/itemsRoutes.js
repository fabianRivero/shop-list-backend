import express from "express";
import auth from "../middlewares/auth.js";
import { createItem, deleteItem, editItem, getItem, getitems } from "../controllers/itemsController.js";

const router = express.Router();

router.get("/", [auth], getitems);

router.get("/:id", [auth], getItem);

router.post("/", [auth], createItem);

router.put("/:id", [auth], editItem);

router.delete("/:id", [auth], deleteItem);




export default router;
