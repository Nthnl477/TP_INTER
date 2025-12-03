import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined")
}

// Cache the connection to reuse across hot reloads in development
let cachedConnection: typeof mongoose

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection
  }

  const connection = await mongoose.connect(MONGODB_URI)
  cachedConnection = connection
  return connection
}

export default connectToDatabase
