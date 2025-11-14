const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env from backend/.env when run from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Car = require('../models/Car');

async function ensureOwnerUser() {
  // Prefer any existing user; otherwise create a simple seed user
  let user = await User.findOne({});
  if (user) return user;

  user = new User({
    name: 'Seed User',
    email: 'seeduser@example.com',
    password: 'password123',
    role: 'user'
  });
  await user.save();
  return user;
}

async function run() {
  try {
    await connectDB();

    const owner = await ensureOwnerUser();

    const carsToInsert = [
      {
        brand: 'Hyundai',
        model: 'i20',
        year: 2021,
        price: 9000,
        color: 'White',
        mileage: 24000,
        description: 'Compact hatchback in great condition.'
      },
      {
        brand: 'Maruti Suzuki',
        model: 'Swift',
        year: 2020,
        price: 8000,
        color: 'Red',
        mileage: 30000,
        description: 'Reliable daily driver with good mileage.'
      },
      {
        brand: 'Tata',
        model: 'Nexon',
        year: 2022,
        price: 14000,
        color: 'Blue',
        mileage: 15000,
        description: 'Compact SUV with modern safety features.'
      },
      {
        brand: 'Honda',
        model: 'City',
        year: 2019,
        price: 11000,
        color: 'Silver',
        mileage: 42000,
        description: 'Spacious sedan, smooth ride, single owner.'
      },
      {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2018,
        price: 10500,
        color: 'Grey',
        mileage: 50000,
        description: 'Well-maintained, service history available.'
      }
    ].map(c => ({ ...c, owner: owner._id }));

    const created = await Car.insertMany(carsToInsert);
    console.log(`Inserted ${created.length} cars.`);
  } catch (err) {
    console.error('Error inserting cars:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();


