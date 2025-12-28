import express from 'express';
const router = express.Router();
import loanController from '../controllers/loanController.js';

router.get('/', loanController.getAllLoans);
router.get('/:id', loanController.getLoanById);
router.post('/', loanController.createLoan);
router.patch('/:id/status', loanController.updateLoanStatus);

export default router;
