import PurchaseLog from '../models/PurchaseLog.js';
import dayjs from 'dayjs';

//obtener todos los dias
export async function getDailyRegister(req, res){
  try {
    const userId = req.user.id;

    const dailyRegister = await PurchaseLog.find({ userId });
    res.status(200).json({ dailyRegister: dailyRegister });
  } catch (err) {
    res.status(500).send({ message: "Server Error" + err.message });
  }
}

//obtener un dia en especifico
export async function getDayRegister(req, res){
  try {
    const { date } = req.params;
    const userId = req.user.id;
    
    const dayRegister = await PurchaseLog.find({ userId, date: new Date(date) });
    res.status(200).json({ dayRegister: dayRegister });
  } catch (err) {
    res.status(500).send({ message: "Server Error" + err.message });
  }
}

//crear compra
export async function createPurchase(req, res) {
  try {
    const { date, purchase } = req.body;
    const userId = req.user.id;

    await PurchaseLog.findOneAndUpdate(
      { userId, date: date },
      {
        $push: { purchases: purchase },
        $setOnInsert: {
          userId,
          date: date,
        }
      },
      { upsert: true }
    );

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
    const userId = req.user.id;
    const { purchaseId, purchaseQuantity, price } = req.body;

    if (!purchaseId || typeof purchaseQuantity !== 'number' || typeof price !== 'number') {
      return res.status(400).json({
        message: 'purchaseId, purchaseQuantity and price are required'
      });
    }

    await PurchaseLog.findOneAndUpdate(
      { userId, date: new Date(date), 'purchases.purchaseId': purchaseId }, 
      {
        $set: {
          'purchases.$.purchaseQuantity': purchaseQuantity,
          'purchases.$.price': price
        }
      },
      { new: true } 
    );

    res.status(200).json({ message: 'Purchases updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

//borrar compra

export async function deletePurchase(req, res){
  try {
    const { date } = req.params;
    const userId = req.user.id;
    const { purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(404).json({ message: 'purchaseId is required' });
    }

    const result = await PurchaseLog.findOneAndUpdate(
      { userId, date: new Date(date) },
      { $pull: { purchases: { purchaseId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Purchase log not found for this date' });
    }

    res.status(200).json({ message: 'Purchase(s) deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

//obtener dias por periodo de tiempo

export async function getSummary(req, res) {
  try {
    const { period = 'day', offset = 0, sector } = req.query;
    const userId = req.user.id;

    const baseDate = dayjs(); 
    const shift = parseInt(offset, 10);

    let startDate, endDate;

    if (period === 'day') {
      baseDate.add(shift, 'day');
    } else if (period === 'week') {
      const targetDate = baseDate.add(shift, 'week');
      startDate = targetDate.startOf('isoWeek').toDate();
      endDate = targetDate.endOf('isoWeek').toDate();
    } else if (period === 'month') {
      const targetDate = baseDate.add(shift, 'month');
      startDate = targetDate.startOf('month').toDate();
      endDate = targetDate.endOf('month').toDate();
    } else if (period === 'year') {
      const targetDate = baseDate.add(shift, 'year');
      startDate = targetDate.startOf('year').toDate();
      endDate = targetDate.endOf('year').toDate();
    } else {
      return res.status(400).json({ message: 'Invalid period' });
    }

    // Armar filtro base
    const query = {
      userId,
      date: { $gte: startDate, $lte: endDate }
    };

    // Agregar sector si fue enviado
    if (sector) {
      query['purchases.sector'] = sector;
    }

    const logs = await PurchaseLog.find(query);

    res.json({ logs, period, startDate, endDate });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching summary: ' + err.message });
  }
}

