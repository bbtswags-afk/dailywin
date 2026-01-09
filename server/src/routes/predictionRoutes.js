import express from 'express';
import { getPredictions, getLive } from '../controllers/predictionController.js';
import { getHistory } from '../controllers/historyController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply optionalProtect because we handle both Guest (no token) and User (with token)
router.get('/', optionalProtect, getPredictions);
router.get('/live', getLive); // Public route for live scores
router.get('/history', getHistory);

export default router;
