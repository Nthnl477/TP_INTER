import mongoose from "mongoose"

// Cache the connection to reuse across hot reloads in development
let cachedConnection: typeof mongoose

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection
  }

  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined")
  }

  const connection = await mongoose.connect(uri)
  cachedConnection = connection
  return connection
}

export default connectToDatabase
