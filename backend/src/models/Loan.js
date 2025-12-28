import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  loanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [1000, 'Minimum loan amount is ₹1000']
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  tenure: {
    type: Number,
    required: [true, 'Loan tenure is required'],
    min: [1, 'Minimum tenure is 1 month']
  },
  purpose: {
    type: String,
    enum: ['Seeds', 'Fertilizers', 'Equipment', 'Irrigation', 'Livestock', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Disbursed', 'Rejected', 'Closed'],
    default: 'Pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  disbursementDate: Date,
  aiScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

loanSchema.index({ farmerId: 1, status: 1 });

export default mongoose.model('Loan', loanSchema);
