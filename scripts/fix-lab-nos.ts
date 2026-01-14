import mongoose from "mongoose"
import connectToDatabase from "../lib/db/connection"
import { Etablissement } from "../lib/db/models/Etablissement"

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("Missing MONGODB_URI in environment.")
      process.exit(1)
    }

    await connectToDatabase()
    const code = "750100456"

    const res = await Etablissement.updateMany(
      { typeEtablissement: "LABORATOIRE", $or: [{ codeNOS: { $exists: false } }, { codeNOS: { $eq: "" } }] },
      { $set: { codeNOS: code } },
    )
    console.info(`Updated ${res.modifiedCount} laboratoire(s) with code NOS ${code}.`)
  } catch (error) {
    console.error("Error updating laboratory code NOS:", error)
  } finally {
    await mongoose.connection.close()
  }
}

main()
