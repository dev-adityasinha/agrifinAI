import express from 'express';
const router = express.Router();
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  incrementInquiry
} from '../controllers/productController.js';

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Product management routes
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Status and inquiry routes
router.patch('/:id/status', updateProductStatus);
router.post('/:id/inquiry', incrementInquiry);

export default router;
