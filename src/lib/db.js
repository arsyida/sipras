import monggoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
}

let cachedDb = global.mongoose;
if (!cachedDb) {
    cachedDb = global.mongoose = { conn: null, promise: null };
}
async function connectToDatabase() {
    if (cachedDb.conn) {
        return cachedDb.conn;
    }

    if (!cachedDb.promise) {
        cachedDb.promise = monggoose.connect(MONGODB_URI, {bufferCommands:false}).then((mongoose) => mongoose);
    }

    try {
      cachedDb.conn = await cachedDb.promise;
    } catch (error) {
      cachedDb.promise = null;
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
    return cachedDb.conn;
}
export default connectToDatabase;