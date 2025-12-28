const mongoose = require('mongoose');
const app = require('./app');

// Vercel will call this handler for each request. We connect to DB as needed without starting a listener.
module.exports = async (req, res) => {
  try {
    // Reuse connection across lambda invocations
    if (!global.__MONGO_CONN__ || mongoose.connection.readyState === 0) {
      global.__MONGO_CONN__ = mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await global.__MONGO_CONN__;
      console.log('Connected to MongoDB (vercel handler)');
    }
  } catch (err) {
    console.error('MongoDB connection error in Vercel handler:', err);
    res.status(500).json({ success: false, message: 'DB Connection failed' });
    return;
  }

  // Express app can be used directly as a handler
  return app(req, res);
};