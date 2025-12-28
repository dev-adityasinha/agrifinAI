import Loan from '../models/Loan.js';
import Farmer from '../models/Farmer.js';

export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('farmerId', 'name email phone');
    
    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('farmerId');
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

export const createLoan = async (req, res) => {
  try {
    // Verify farmer exists
    const farmer = await Farmer.findById(req.body.farmerId);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Calculate AI score (simple logic - can be enhanced)
    const aiScore = calculateAIScore(farmer, req.body);
    req.body.aiScore = aiScore;

    const loan = await Loan.create(req.body);
    
    // Update farmer's loan status
    farmer.loanStatus = 'Applied';
    await farmer.save();

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

export const updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    loan.status = status;
    
    if (status === 'Approved') {
      loan.approvalDate = new Date();
    } else if (status === 'Disbursed') {
      loan.disbursementDate = new Date();
    }

    await loan.save();

    // Update farmer's loan status
    const farmer = await Farmer.findById(loan.farmerId);
    if (farmer) {
      farmer.loanStatus = status === 'Approved' ? 'Approved' : status === 'Disbursed' ? 'Active' : status;
      await farmer.save();
    }

    res.status(200).json({
      success: true,
      message: `Loan ${status.toLowerCase()} successfully`,
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Update Error',
      error: error.message
    });
  }
};

// Simple AI Score calculation
function calculateAIScore(farmer, loanData) {
  let score = 50; // Base score
  
  if (farmer.creditScore > 700) score += 20;
  else if (farmer.creditScore > 600) score += 10;
  
  if (farmer.landSize > 5) score += 15;
  else if (farmer.landSize > 2) score += 10;
  
  if (loanData.loanAmount < 100000) score += 15;
  
  return Math.min(score, 100);
}

export default { getAllLoans, getLoanById, createLoan, updateLoanStatus };
