import express from "express";
import { deleteGeneralBudget, deleteSectorBudget, getSummary, updateGeneralBudget, updateSectorBudget } from "../controllers/summaryController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// GET /api/summary?date=2025-08-20&period=month&sector=alimentos
router.get("/summary", [auth], getSummary);

// PUT /api/budgets/general
router.put("/generalBudget/:year/:month", [auth], updateGeneralBudget);

// PUT /api/budgets/sector
router.put("/sectorBudget/:year/:month/:sector", [auth], updateSectorBudget);

// DELETE /api/budgets/:year/:month/general
router.delete("/budgets/:year/:month/general", [auth], deleteGeneralBudget);

// DELETE /api/budgets/:year/:month/general
router.delete("/budgets/:year/:month/sectors/:sector", [auth], deleteSectorBudget );

export default router;