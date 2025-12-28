import express from 'express';
const router = express.Router();
import farmerController from '../controllers/farmerController.js';

router.get('/', farmerController.getAllFarmers);
router.get('/:id', farmerController.getFarmerById);
router.post('/', farmerController.createFarmer);
router.put('/:id', farmerController.updateFarmer);
router.delete('/:id', farmerController.deleteFarmer);

export default router;
