const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const Car = require('../models/Car');

const imageMap = new Map([
  [ 'Hyundai|i20', 'https://images.unsplash.com/photo-1590431252400-9f3b9e2d1f8a?q=80&w=1200&auto=format&fit=crop' ],
  [ 'Maruti Suzuki|Swift', 'https://images.unsplash.com/photo-1549921296-3a6b6a53c9b3?q=80&w=1200&auto=format&fit=crop' ],
  [ 'Tata|Nexon', 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format&fit=crop' ],
  [ 'Honda|City', 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1200&auto=format&fit=crop' ],
  [ 'Toyota|Corolla', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop' ],
]);

async function run() {
  try {
    await connectDB();

    let updatedCount = 0;
    for (const [key, url] of imageMap.entries()) {
      const [brand, model] = key.split('|');
      const res = await Car.updateMany(
        { brand, model, image: { $in: [null, '', undefined] } },
        { $set: { image: url } }
      );
      updatedCount += res.modifiedCount || 0;
    }

    console.log(`Updated images for ${updatedCount} cars.`);
  } catch (e) {
    console.error('Error setting images:', e);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();


