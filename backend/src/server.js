import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 8080;

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Received shutdown signal. Closing HTTP server...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
};

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrifinai')
    .then(() => {
        console.log('✅ Connected to MongoDB');
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/health`);
        });
        
        // Set server timeout for graceful shutdown
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });