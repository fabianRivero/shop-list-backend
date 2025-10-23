import PurchaseLog from "../models/PurchaseLog.js";
import MonthlyBudget from "../models/Budget.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { filterByPeriod } from "../utils/filterByPeriod.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function normalizeMonthlyBudget(userId, year, month) {
  let budget = await MonthlyBudget.findOne({ userId, year, month });

  if (!budget) {
    budget = new MonthlyBudget({
      userId,
      year,
      month,
      general: 0,
      sectors: []
    });
    await budget.save();
  }

  const sumSectors = budget.sectors
    .reduce((acc, s) => acc + s.budget, 0);

  if (budget.general < sumSectors) {
    budget.general = sumSectors;
  } 

  await budget.save();
  return budget;
}

export async function getSummary(req, res) {
  try {
    const userId = req.user.id;
    const { date, period = "month", sector, tz = "UTC" } = req.query;

    const baseDate = dayjs.tz(date, tz);
    const year = baseDate.year();
    const month = baseDate.month() + 1;

    let logs = await PurchaseLog.find({ userId });
    let logsFiltered = filterByPeriod(logs, period, baseDate);
    let allPurchases = logsFiltered.flatMap(log => 
      log.purchases.map(p => ({
        ...p.toObject(),
        date: log.date
      }))
    );

    if (sector) {
      allPurchases = allPurchases.filter(p => p.sector === sector);
    }

    const totalSpent = allPurchases.reduce((acc, p) => acc + (p.price * (p.purchaseQuantity / p.quantity )), 0);

    const spentBySector = allPurchases.reduce((acc, p) => {
      acc[p.sector] = (acc[p.sector] || 0) + (p.price * (p.purchaseQuantity / p.quantity ));
      return acc;
    }, {});

    let budgets = [];
    if (period === "year") {
      budgets = await MonthlyBudget.find({ userId, year }).sort({ month: 1 });
    } else {
      const monthlyBudget = await normalizeMonthlyBudget(userId, year, month);
      budgets = [monthlyBudget];
    }

    const budgetsAdapted = budgets.map(b => {

      const sectorsFiltered = sector ? b.sectors.filter(s => s.sector === sector) : b.sectors;
      return {
        month: b.month,
        year: b.year,
        general: b.general,
        sectors: sectorsFiltered.map(s => ({
          sector: s.sector,
          budget: s.budget,
          spent: spentBySector[s.sector] || 0
        }))
      };
    });

    res.json({
      period,
      baseDate: baseDate.toISOString(),
      totalSpent,
      spentBySector,
      budgets: budgetsAdapted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener resumen" });
  }
}

export async function updateGeneralBudget(req, res) {
  const userId = req.user.id;
  const { year, month } = req.params;
  const { general } = req.body;

  try {
  let budget = await MonthlyBudget.findOne({ userId, year, month });

    if (!budget) {
      budget = new MonthlyBudget({ userId, year, month, general, sectors: [] });
      await budget.save();
    } else {
      budget.general = general;
      await budget.save();
    }

    const normalized = await normalizeMonthlyBudget(userId, year, month);

    res.json(normalized);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateSectorBudget(req, res) {
  try {
    const userId = req.user.id;
    const { year, month, sector } = req.params;
    const { budget } = req.body;

    let getBudget = await MonthlyBudget.findOne({ userId, year, month });
    if (!getBudget) {
      getBudget = new MonthlyBudget({ userId, year, month, general: 0, sectors: [] });
    }

    const sectorIndex = getBudget.sectors.findIndex(s => s.sector === sector);
    if (sectorIndex >= 0) {
      getBudget.sectors[sectorIndex].budget = budget;
    } else {
      getBudget.sectors.push({ sector, budget, spent: 0 });
    }

    await getBudget.save();
    const normalized = await normalizeMonthlyBudget(userId, year, month);

    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar presupuesto sectorial" });
  }
}

export async function deleteGeneralBudget(req, res){
  try{
    const userId = req.user.id;
    const { year, month } = req.params;
    
    let getBudget = await MonthlyBudget.findOne({ userId, year, month });
     
    if (!getBudget) {
      return res.status(404).json({ error: "Presupuesto no encontrado"});
    }
    
    getBudget.general = 0;

    getBudget.sectors = [];

    await getBudget.save();

    const normalized = await normalizeMonthlyBudget(userId, year, month);
    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar presupuesto general" })
  }
} 

export async function deleteSectorBudget(req, res) {
  try{
    const userId = req.user.id;
    const { year, month, sector } = req.params;

    let getBudget = await MonthlyBudget.findOne({ userId, year, month });
    if(!getBudget){
      return res.status(404).json({ error: "presupeusto no encontrado" });
    }

    getBudget.sectors = getBudget.sectors.filter(s => s.sector !== sector);
    await getBudget.save();

    const normalized = await normalizeMonthlyBudget(userId, year, month);
    res.json(normalized);
  } catch (err){
    console.error(err);
    res.status(500).json({ error: "Error al eliminar presupuesto sectorial" });
  }
}