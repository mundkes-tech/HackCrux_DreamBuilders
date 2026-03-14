const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.DATABASE_NAME || undefined,
  });

  console.log("MongoDB connected");
};

module.exports = connectDatabase;