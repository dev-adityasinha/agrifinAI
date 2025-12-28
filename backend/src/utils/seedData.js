import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Sample Products Data
const sampleProducts = [
  {
    productName: "Fresh Tomatoes",
    category: "Vegetables",
    quantity: 100,
    unit: "kg",
    price: 40,
    description: "Fresh organic tomatoes directly from farm",
    location: "Rajkot",
    district: "Rajkot",
    state: "Gujarat",
    pincode: "360001",
    contactName: "Ramesh Patel",
    contactPhone: "9876543210",
    contactEmail: "ramesh@example.com",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1546470427-227a5e20df8e?w=400",
      "https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400"
    ]
  },
  {
    productName: "Organic Rice",
    category: "Grains",
    quantity: 500,
    unit: "kg",
    price: 50,
    description: "Premium quality organic basmati rice",
    location: "Ahmedabad",
    district: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",
    contactName: "Suresh Kumar",
    contactPhone: "9876543211",
    contactEmail: "suresh@example.com",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
    ]
  },
  {
    productName: "Fresh Wheat",
    category: "Grains",
    quantity: 1000,
    unit: "kg",
    price: 25,
    description: "Quality wheat grains from Punjab farms",
    location: "Ludhiana",
    district: "Ludhiana",
    state: "Punjab",
    pincode: "141001",
    contactName: "Harpreet Singh",
    contactPhone: "9876543212",
    contactEmail: "harpreet@example.com",
    status: "pending",
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"
    ]
  },
  {
    productName: "Fresh Potatoes",
    category: "Vegetables",
    quantity: 200,
    unit: "kg",
    price: 20,
    description: "Fresh farm potatoes, best quality",
    location: "Bangalore",
    district: "Bangalore Urban",
    state: "Karnataka",
    pincode: "560001",
    contactName: "Rajesh Reddy",
    contactPhone: "9876543213",
    contactEmail: "rajesh@example.com",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400"
    ]
  },
  {
    productName: "Fresh Onions",
    category: "Vegetables",
    quantity: 150,
    unit: "kg",
    price: 30,
    description: "Red onions, premium quality",
    location: "Nashik",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "422001",
    contactName: "Amit Sharma",
    contactPhone: "9876543214",
    contactEmail: "amit@example.com",
    status: "pending",
    images: [
      "https://images.unsplash.com/photo-1587500241088-b3c6c7af5c94?w=400"
    ]
  },
  {
    productName: "Fresh Mangoes",
    category: "Fruits",
    quantity: 80,
    unit: "kg",
    price: 100,
    description: "Alphonso mangoes from Konkan region",
    location: "Ratnagiri",
    district: "Ratnagiri",
    state: "Maharashtra",
    pincode: "415612",
    contactName: "Prakash Patil",
    contactPhone: "9876543215",
    contactEmail: "prakash@example.com",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"
    ]
  },
  {
    productName: "Fresh Milk",
    category: "Dairy",
    quantity: 50,
    unit: "liter",
    price: 60,
    description: "Pure cow milk, hygienically packed",
    location: "Anand",
    district: "Anand",
    state: "Gujarat",
    pincode: "388001",
    contactName: "Mukesh Patel",
    contactPhone: "9876543216",
    contactEmail: "mukesh@example.com",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400"
    ]
  },
  {
    productName: "Organic Honey",
    category: "Other",
    quantity: 30,
    unit: "kg",
    price: 400,
    description: "Pure organic honey from Himalayan region",
    location: "Shimla",
    district: "Shimla",
    state: "Himachal Pradesh",
    pincode: "171001",
    contactName: "Anil Kumar",
    contactPhone: "9876543217",
    contactEmail: "anil@example.com",
    status: "rejected",
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784422?w=400"
    ]
  }
];

// Sample Users Data
const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@agrifin.com",
    password: "admin123",
    role: "admin"
  },
  {
    name: "John Farmer",
    email: "john@example.com",
    password: "password123",
    role: "farmer"
  },
  {
    name: "Priya Singh",
    email: "priya@example.com",
    password: "password123",
    role: "user"
  },
  {
    name: "Rahul Verma",
    email: "rahul@example.com",
    password: "password123",
    role: "farmer"
  },
  {
    name: "Anjali Desai",
    email: "anjali@example.com",
    password: "password123",
    role: "user"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrifin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert Products
    console.log('📦 Inserting sample products...');
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ ${products.length} products inserted`);

    // Insert Users (with hashed passwords)
    console.log('👥 Inserting sample users...');
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    
    const users = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ ${users.length} users inserted`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Products: ${products.length}`);
    console.log(`   • Users: ${users.length}`);
    console.log('\n📋 Sample Credentials:');
    console.log('   • Admin: admin@agrifin.com / admin123');
    console.log('   • User: john@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
