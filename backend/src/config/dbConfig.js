import mongoose from 'mongoose';

import { MONGODB_URI, NODE_ENV } from './serverConfig.js';

const connectDB = async () => {
  try {
    if (NODE_ENV === 'development') {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } else {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    console.log(`--- MongoDB connected using ${NODE_ENV} environment ---`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default connectDB;
