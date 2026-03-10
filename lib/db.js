import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://himu26:HHimavanth4762105@ac-ldqb0tl-shard-00-00.rwe1nc9.mongodb.net:27017,ac-ldqb0tl-shard-00-01.rwe1nc9.mongodb.net:27017,ac-ldqb0tl-shard-00-02.rwe1nc9.mongodb.net:27017/yojana-sahayak?ssl=true&replicaSet=atlas-j8s18y-shard-0&authSource=admin&retryWrites=true&w=majority&appName=HimuCluster";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
