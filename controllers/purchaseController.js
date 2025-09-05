import PurchaseLog from '../models/PurchaseLog.js';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { v4 as uuidv4 } from "uuid";
import Budget from "../models/Budget.js";

dayjs.extend(utc);
dayjs.extend(timezone);

//obtener todos los dias
export async function getDailyRegister(req, res){
  try {
    const userId = req.user.id;

    const dailyRegister = await PurchaseLog.find({ userId });
    res.status(200).json({ register: dailyRegister });
  } catch (err) {
    res.status(500).send({ message: "Server Error" + err.message });
  }
}

  //obtener un dia en especifico
export async function getDayRegister(req, res) {
  try {
    const { date } = req.params; 
    const { timeZone = "UTC" } = req.query; 
    const userId = req.user.id;

    // calcular inicio y fin del día en la zona del usuario
    const startOfDay = dayjs.tz(date, timeZone).startOf("day").utc().toDate();
    const endOfDay   = dayjs.tz(date, timeZone).endOf("day").utc().toDate();

    const dayRegister = await PurchaseLog.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.status(200).json({ register: dayRegister });
  } catch (err) {
    res.status(500).send({ message: "Server Error " + err.message });
  }
}

//crear compra
export async function createPurchase(req, res) {
  try {
    const { date, purchases, timeZone = "UTC" } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(purchases) || purchases.length === 0) {
      return res.status(400).json({ message: "No purchases provided" });
    }
    
    let purchase = purchases[0];
    if (!purchase.purchaseId) {
      purchase.purchaseId = uuidv4();
    }

    const normalizedDate = dayjs.tz(date, timeZone).startOf("day").utc().toDate();

    await PurchaseLog.findOneAndUpdate(
      { userId, date: normalizedDate },
      {
        $push: { purchases: purchase },
        $setOnInsert: { userId, date: normalizedDate }
      },
      { upsert: true }
    );

    const month = dayjs(date).month() + 1; 
    const year = dayjs(date).year();

    const budget = await Budget.findOne({ userId, month, year });

    if (budget) {
      const exists = budget.sectors.some(s => s.sector === purchase.sector);

      if (!exists) {
        budget.sectors.push({
          sector: purchase.sector,
          amount: 0
        });
        await budget.save();
      }
    } else {
      await Budget.create({
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        general: 0,
        month,
        year,
        sectors: [{ sector: purchase.sector, amount: 0 }]
      });
    }

    res.status(201).json({ message: 'Purchase(s) registered successfully' });
  } catch (error) {
    console.error('Error registering purchase:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//editar compra

export async function updatePurchase(req, res){
  try {
    const { date } = req.params;
    const { purchaseId, purchaseQuantity, price, sector, timeZone = "UTC" } = req.body;
    const userId = req.user.id;

    if (!purchaseId || typeof purchaseQuantity !== 'number' || typeof price !== 'number') {
      return res.status(400).json({
        message: 'purchaseId, purchaseQuantity and price are required'
      });
    }

    const startOfDay = dayjs.tz(date, req.body.timeZone || "UTC").startOf("day").utc().toDate();
    const endOfDay = dayjs.tz(date, req.body.timeZone || "UTC").endOf("day").utc().toDate();

    const log = await PurchaseLog.findOne({ 
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }, 
      'purchases.purchaseId': purchaseId });

    if (!log) return res.status(404).json({ message: 'Purchase not found' });

    const purchase = log.purchases.find(p => p.purchaseId === purchaseId);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    purchase.purchaseQuantity = purchaseQuantity;
    purchase.price = price;

    if (sector) {
      purchase.sector = sector;
    }

    await log.save();

    if (sector) {
      const month = dayjs(date).month() + 1;
      const year = dayjs(date).year();

      const budget = await Budget.findOne({ userId, month, year });

      if (budget) {
        const exists = budget.sectors.some(s => s.sector === sector);
        if (!exists) {
          budget.sectors.push({ sector, amount: 0 });
          await budget.save();
        }
      } else {
        await Budget.create({
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          general: 0,
          month,
          year,
          sectors: [{ sector, amount: 0 }]
        });
      }
    }

    res.status(200).json(purchase);
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

//borrar compra

export async function deletePurchase(req, res){
  try {
    const { date } = req.params;
    const userId = req.user.id;
    const { timeZone, purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ message: 'purchaseId is required' });
    }

    const localDate = dayjs.tz(date, timeZone).startOf("day").utc().toDate();

    const result = await PurchaseLog.findOneAndUpdate(
      { userId, date: localDate },
      { $pull: { purchases: { purchaseId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Purchase log not found for this date' });
    }

    if (result.purchases.length === 0) {
      await PurchaseLog.deleteOne({ _id: result._id });
      return res.status(200).json({ message: 'Purchase deleted and shopList removed (empty)' });
    }

    res.status(200).json({ message: 'Purchase(s) deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

function getUtcDayRange(baseDate, timeZone, period, offset = 0) {
  const referenceDate = dayjs.tz(baseDate, timeZone).add(offset, period);

  let startDate, endDate;

  switch (period) {
    case "day":
      startDate = referenceDate.startOf("day").utc().toDate();
      endDate = referenceDate.endOf("day").utc().toDate();
      break;
    case "week":
      startDate = referenceDate.startOf("isoWeek").utc().toDate();
      endDate = referenceDate.endOf("isoWeek").utc().toDate();
      break;
    case "month":
      startDate = referenceDate.startOf("month").utc().toDate();
      endDate = referenceDate.endOf("month").utc().toDate();
      break;
    case "year":
      startDate = referenceDate.startOf("year").utc().toDate();
      endDate = referenceDate.endOf("year").utc().toDate();
      break;
    default:
      throw new Error("Invalid period");
  }

  return { startDate, endDate };
}

//obtener compras por caracteristicas especificas

export async function getPurchases(req, res) {
  try {
    const { period = "day", offset = 0, sector, baseDate = new Date(), timeZone = "UTC" } = req.query;
    const userId = req.user.id;

    const { startDate, endDate } = getUtcDayRange(baseDate, timeZone, period, parseInt(offset, 10));

    const query = {
      userId,
      date: { $gte: startDate, $lte: endDate }
    };

    if (sector) {
      query["purchases.sector"] = sector;
    }

    const logs = await PurchaseLog.find(query);

    res.status(200).json({
      register: { logs, period, startDate, endDate, timeZone }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summary: " + err.message });
  }
}
