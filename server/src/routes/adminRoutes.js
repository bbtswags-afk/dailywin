import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAdminStats, manualUpgrade, getPremiumUsers, downgradeUser, deleteUser } from '../controllers/adminController.js';
// Duplicate import removed

const router = express.Router();

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getPremiumUsers); // List Users
router.post('/upgrade', protect, admin, manualUpgrade);
router.post('/downgrade', protect, admin, downgradeUser); // Revoke
router.post('/delete', protect, admin, deleteUser); // Delete

export default router;
