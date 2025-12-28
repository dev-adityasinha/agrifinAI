import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  address: {
    village: String,
    district: String,
    state: String,
    pincode: String
  },
  landSize: {
    type: Number,
    required: [true, 'Land size is required'],
    min: [0, 'Land size cannot be negative']
  },
  cropType: {
    type: String,
    enum: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Vegetables', 'Fruits', 'Other'],
    default: 'Other'
  },
  loanStatus: {
    type: String,
    enum: ['None', 'Applied', 'Approved', 'Rejected', 'Active', 'Closed'],
    default: 'None'
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 900,
    default: 500
  },
  aiRecommendations: [{
    recommendation: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster searches
farmerSchema.index({ email: 1, phone: 1 });

export default mongoose.model('Farmer', farmerSchema);
