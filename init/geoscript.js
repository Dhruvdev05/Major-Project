const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log("Connected to DB");
    return fixMissingGeometry(); // Run update after connecting
  })
  .catch((err) => {
    console.error("Error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

async function fixMissingGeometry() {
  const result = await Listing.updateMany(
    { geometry: { $exists: false } },
    {
      $set: {
        geometry: {
          type: 'Point',
          coordinates: [77.1025, 28.7041] // Delhi coords or any default
        }
      }
    }
  );
  
  console.log(`${result.modifiedCount} listings updated.`);
  mongoose.connection.close();
}