import express from 'express';
import authRoutes from './authRoutes.js';
import farmerRoutes from './farmerRoutes.js';
import loanRoutes from './loanRoutes.js';
import productRoutes from './productRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/farmers', farmerRoutes);
router.use('/loans', loanRoutes);
router.use('/products', productRoutes);

export default router;