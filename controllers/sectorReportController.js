import PurchaseLog from '../models/PurchaseLog.js';
import SectorSummary from '../models/SectorSummary.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';

dayjs.extend(isoWeek);

export const getSectorSummaryByPeriod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period, date } = req.query;

    if (!['daily', 'weekly'].includes(period)) {
      return res.status(400).json({ message: 'Period must be "daily" or "weekly"' });
    }

    let targetDate;

    if (period === 'daily') {
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format for daily period' });
      }
      targetDate = date ? dayjs(date) : dayjs();
    }

    if (period === 'weekly') {
      if (date && !/^\d{4}-W\d{1,2}$/.test(date)) {
        return res.status(400).json({ message: 'Date must be in YYYY-W## format for weekly period' });
      }
      const [year, week] = (date ?? `${dayjs().format('YYYY')}-W${dayjs().isoWeek()}`).split('-W');
      targetDate = dayjs().year(parseInt(year)).isoWeek(parseInt(week));
    }

    let start, end, periodKey;
    if (period === 'daily') {
      start = targetDate.startOf('day');
      end = targetDate.endOf('day');
      periodKey = targetDate.format('YYYY-MM-DD');
    } else {
      start = targetDate.startOf('isoWeek');
      end = targetDate.endOf('isoWeek');
      periodKey = `${targetDate.format('YYYY')}-W${targetDate.isoWeek()}`;
    }

    // Paso 1: Buscar compras en el rango
    const purchases = await PurchaseLog.find({
      userId,
      date: { $gte: start.toDate(), $lte: end.toDate() }
    });

    // Paso 2: Agrupar por sector
    const sectorTotals = {};
    for (const purchase of purchases) {
      for (const p of purchase.products) {
        if (!sectorTotals[p.sector]) {
          sectorTotals[p.sector] = 0;
        }
        sectorTotals[p.sector] += p.price * p.purchasedQuantity;
      }
    }

    // Paso 3: Obtener presupuesto mensual
    const monthKey = targetDate.format('YYYY-MM');
    const sectorBudgets = await SectorSummary.find({ userId, periodKey: monthKey });

    // Paso 4: Calcular divisores
    const startOfMonth = targetDate.startOf('month');
    const endOfMonth = targetDate.endOf('month');
    let divisor = 1;

    if (period === 'weekly') {
      const weeks = new Set();
      for (let d = startOfMonth; d.isBefore(endOfMonth); d = d.add(1, 'day')) {
        weeks.add(`${d.format('YYYY')}-W${d.isoWeek()}`);
      }
      divisor = weeks.size;
    } else {
      divisor = endOfMonth.date();
    }

    // Paso 5: Armar respuesta
    const result = [];

    for (const sector in sectorTotals) {
      const monthlyBudget = sectorBudgets.find(s => s.sector === sector)?.budget ?? null;
      const partialBudget = monthlyBudget ? monthlyBudget / divisor : null;

      result.push({
        sector,
        periodKey,
        totalSpent: sectorTotals[sector],
        budget: partialBudget
      });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error calculating summary: ' + err.message });
  }
};


export const getMonthlySectorSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    // Validar formato YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Invalid or missing month. Use format YYYY-MM.' });
    }

    const summaries = await SectorSummary.find({
      userId,
      periodKey: month,
      isDeleted: { $ne: true }
    }).select('sector periodKey totalSpent budget');

    res.status(200).json(summaries);
  } catch (err) {
    res.status(500).json({ message: 'Error getting monthly summaries: ' + err.message });
  }
};
