import express from "express";
import { deleteGeneralBudget, deleteSectorBudget, getSummary, updateGeneralBudget, updateSectorBudget } from "../controllers/summaryController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/summary", [auth], getSummary);

router.put("/generalBudget/:year/:month", [auth], updateGeneralBudget);

router.put("/sectorBudget/:year/:month/:sector", [auth], updateSectorBudget);

router.delete("/budgets/:year/:month/general", [auth], deleteGeneralBudget);

router.delete("/budgets/:year/:month/sectors/:sector", [auth], deleteSectorBudget );

export default router;