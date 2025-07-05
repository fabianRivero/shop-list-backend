import express from 'express';
import {
  createSector,
  getAllSectors,
  getSectorById,
  updateSector,
  deleteSector,
  restoreSector
} from '../controllers/sectorController.js';
import auth from '../middlewares/auth.js';
import {
  getMonthlySectorSummary,
  getSectorSummaryByPeriod
} from '../controllers/sectorReportController.js';

const router = express.Router();

router.post('/', [auth], createSector); //X
router.get('/summary', [auth], getSectorSummaryByPeriod); 
router.get('/monthly-summary', [auth], getMonthlySectorSummary);
router.get('/', [auth], getAllSectors); //X
router.get('/:id', [auth], getSectorById); //X
router.put('/:id', [auth], updateSector); //x
router.patch('/:id', [auth], deleteSector); //x
router.patch('/:id/restore', [auth], restoreSector); //x

export default router;
