import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Pulses', 'Spices', 'Oils & Seeds', 'Other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be positive']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'ton', 'liter', 'dozen', 'piece'],
    default: 'kg'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
  },
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  deliveryOptions: [{
    type: String,
    enum: ['farm-pickup', 'local-delivery', 'regional-delivery', 'nationwide']
  }],
  organicCertified: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold'],
    default: 'pending'
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster searches
productSchema.index({ category: 1, status: 1 });
productSchema.index({ district: 1, state: 1 });
productSchema.index({ price: 1 });

export default mongoose.model('Product', productSchema);
