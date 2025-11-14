const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Car = require('../models/Car');
const connectDB = require('../config/db');

let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
} catch (e) {
  console.error('cloudinary package not installed');
  process.exit(1);
}

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary env vars. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const assetsDir = path.join(__dirname, '..', 'assets');

const fileMap = [
  { brand: 'Maruti Suzuki', model: 'Swift', filename: 'swift.jpg' },
  { brand: 'Honda', model: 'City', filename: 'city.jpg' },
  { brand: 'Toyota', model: 'Corolla', filename: 'corolla.jpg' },
  { brand: 'Hyundai', model: 'i20', filename: 'i20.jpg' },
  { brand: 'Tata', model: 'Nexon', filename: 'nexon.jpg' }
];

async function ensureFilesExist() {
  const missing = [];
  for (const item of fileMap) {
    const p = path.join(assetsDir, item.filename);
    if (!fs.existsSync(p)) {
      missing.push(item.filename);
    }
  }
  return missing;
}

async function uploadAndAttach() {
  await connectDB();

  const missing = await ensureFilesExist();
  if (missing.length) {
    console.error('Missing files in backend/assets:', missing.join(', '));
    await mongoose.connection.close();
    process.exit(1);
  }

  let updated = 0;
  for (const { brand, model, filename } of fileMap) {
    const filePath = path.join(assetsDir, filename);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'car-management/demo-cars',
        public_id: `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
      });

      const res = await Car.updateMany(
        { brand, model },
        { $set: { image: result.secure_url } }
      );
      updated += res.modifiedCount || 0;
      console.log(`Uploaded ${filename} -> ${result.secure_url} | updated ${res.modifiedCount || 0} docs`);
    } catch (e) {
      console.error(`Failed for ${filename}:`, e.message);
    }
  }

  console.log(`Done. Updated images for ${updated} cars.`);
  await mongoose.connection.close();
}

uploadAndAttach().catch(async (e) => {
  console.error('Unexpected error:', e);
  await mongoose.connection.close();
  process.exit(1);
});


