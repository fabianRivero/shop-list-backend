import SectorSummary from '../models/SectorSummary.js';

export const createSector = async (req, res) => {
  try {
    const { sector, periodKey, items, totalSpent, budget } = req.body;
    const userId = req.user.id;

    if (!sector || !periodKey) {
      return res.status(400).json({ message: 'Sector and periodKey are required' });
    }

    // Validar el formato del periodKey
    const isMonthly = /^\d{4}-\d{2}$/.test(periodKey);

    if (!isMonthly) {
      return res.status(400).json({ message: 'Invalid periodKey format' });
    }

    // Solo permitir budget si es mensual
    if (budget && !isMonthly) {
      return res.status(400).json({ message: 'Budget can only be set for monthly periodKey' });
    }

    // Verificar si ya existe el resumen para ese periodo
    const existing = await SectorSummary.findOne({ userId, sector, periodKey });
    if (existing) {
      return res.status(400).json({ message: 'Sector summary already exists for that period' });
    }

    const summary = new SectorSummary({
      userId,
      sector,
      periodKey,
      totalSpent: totalSpent ?? 0,
      budget: isMonthly ? budget : undefined,
      items: items ?? []
    });

    await summary.save();
    res.status(201).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Error creating sector summary: ' + err.message });
  }
};

export const getAllSectors = async (req, res) => {
  try {
    const summaries = await SectorSummary.find({ userId: req.user.id, isDeleted: { $ne: true } });
    res.status(200).json({ sectors: summaries });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sector summaries: ' + err.message });
  }
};

export const getSectorById = async (req, res) => {
  try {
    const summary = await SectorSummary.findOne({ id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } });
    if (!summary) {
      return res.status(404).json({ message: 'Sector summary not found' });
    }
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sector summary: ' + err.message });
  }
};

export const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const budget = typeof req.body.budget === 'number' ? req.body.budget : undefined;

    if (budget === undefined) {
      return res.status(400).json({ message: 'Only budget can be updated' });
    }

    if (typeof budget !== 'number' || budget < 0) {
      return res.status(400).json({ message: 'Budget must be a number greater than or equal to 0' });
    }

    const updated = await SectorSummary.findOneAndUpdate(
      { id: id, userId: userId },
      { budget },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Sector summary not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating sector summary: ' + err.message });
  }
};

export const deleteSector = async (req, res) => {
  try {
    const updated = await SectorSummary.findOneAndUpdate(
      { id: req.params.id, userId: req.user.id },
      { isDeleted: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Sector summary not found' });
    }

    res.status(200).json({ message: 'Sector summary marked as deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting sector summary: ' + err.message });
  }
};

export const restoreSector = async (req, res) => {
  try {
    const { id } = req.params;

    const restored = await SectorSummary.findOneAndUpdate(
      { id: id, userId: req.user.id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );

    if (!restored) {
      return res.status(404).json({ message: 'Deleted sector not found or already active' });
    }

    res.status(200).json({ message: 'Sector restored successfully', sector: restored });
  } catch (err) {
    res.status(500).json({ message: 'Error restoring sector: ' + err.message });
  }
};
