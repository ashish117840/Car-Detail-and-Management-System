const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Car = require('./models/Car');
const Service = require('./models/Service');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-management-system');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Sarah Davis',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Mike Brown',
    email: 'mike@example.com',
    password: 'password123',
    role: 'user'
  }
];

const USD_TO_INR_RATE = 83;

const mapUsdToInrWithOriginalPrice = (car) => {
  const originalPrice = car.price;

  return {
    ...car,
    originalPrice,
    price: Math.round(originalPrice * USD_TO_INR_RATE)
  };
};

const sampleCars = [
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 25000,
    color: 'Silver',
    mileage: 35000,
    description: 'Well-maintained family sedan with excellent fuel economy.',
    image: null // Will be added by users
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2019,
    price: 22000,
    color: 'Blue',
    mileage: 42000,
    description: 'Reliable compact car perfect for city driving.',
    image: null
  },
  {
    brand: 'BMW',
    model: 'X5',
    year: 2021,
    price: 55000,
    color: 'Black',
    mileage: 18000,
    description: 'Luxury SUV with advanced technology and premium features.',
    image: null
  },
  {
    brand: 'Ford',
    model: 'F-150',
    year: 2020,
    price: 45000,
    color: 'White',
    mileage: 28000,
    description: 'Powerful pickup truck ideal for work and recreation.',
    image: null
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2022,
    price: 48000,
    color: 'Red',
    mileage: 12000,
    description: 'Electric vehicle with cutting-edge technology and autopilot features.',
    image: null
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2021,
    price: 42000,
    color: 'Gray',
    mileage: 15000,
    description: 'Luxury sedan with premium interior and smooth ride.',
    image: null
  },
  {
    brand: 'Nissan',
    model: 'Altima',
    year: 2019,
    price: 19000,
    color: 'White',
    mileage: 38000,
    description: 'Comfortable midsize sedan with good reliability.',
    image: null
  },
  {
    brand: 'Audi',
    model: 'A4',
    year: 2020,
    price: 38000,
    color: 'Black',
    mileage: 22000,
    description: 'German engineering meets luxury and performance.',
    image: null
  }
].map(mapUsdToInrWithOriginalPrice);

const sampleServices = [
  {
    description: 'Regular oil change and filter replacement',
    cost: 75.00,
    serviceType: 'maintenance',
    serviceProvider: 'Quick Lube Express'
  },
  {
    description: 'Brake pad replacement and rotor resurfacing',
    cost: 350.00,
    serviceType: 'repair',
    serviceProvider: 'Auto Repair Center'
  },
  {
    description: 'Annual safety inspection',
    cost: 45.00,
    serviceType: 'inspection',
    serviceProvider: 'State Inspection Station'
  },
  {
    description: 'Transmission fluid change',
    cost: 120.00,
    serviceType: 'maintenance',
    serviceProvider: 'Transmission Specialists'
  },
  {
    description: 'Air conditioning system repair',
    cost: 280.00,
    serviceType: 'repair',
    serviceProvider: 'AC Pro Services'
  },
  {
    description: 'Tire rotation and alignment',
    cost: 85.00,
    serviceType: 'maintenance',
    serviceProvider: 'Tire World'
  },
  {
    description: 'Battery replacement',
    cost: 150.00,
    serviceType: 'repair',
    serviceProvider: 'Battery Plus'
  },
  {
    description: 'Spark plug replacement',
    cost: 95.00,
    serviceType: 'maintenance',
    serviceProvider: 'Engine Masters'
  },
  {
    description: 'Windshield replacement',
    cost: 400.00,
    serviceType: 'repair',
    serviceProvider: 'Glass Doctor'
  },
  {
    description: 'Emissions testing',
    cost: 25.00,
    serviceType: 'inspection',
    serviceProvider: 'Emissions Testing Center'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Car.deleteMany({});
    await Service.deleteMany({});

    // Create users
    console.log('Creating users...');
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Create cars
    console.log('Creating cars...');
    const cars = [];
    for (let i = 0; i < sampleCars.length; i++) {
      const carData = {
        ...sampleCars[i],
        owner: users[i % users.length]._id // Distribute cars among users
      };
      const car = new Car(carData);
      await car.save();
      cars.push(car);
      console.log(`Created car: ${car.brand} ${car.model} (${car.year})`);
    }

    // Create services
    console.log('Creating services...');
    const services = [];
    for (let i = 0; i < sampleServices.length; i++) {
      const serviceData = {
        ...sampleServices[i],
        car: cars[i % cars.length]._id, // Distribute services among cars
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
      };
      const service = new Service(serviceData);
      await service.save();
      services.push(service);
      console.log(`Created service: ${service.description} - $${service.cost}`);

      // Add service to car's services array
      await Car.findByIdAndUpdate(
        service.car,
        { $push: { services: service._id } },
        { new: true }
      );
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Cars: ${cars.length}`);
    console.log(`- Services: ${services.length}`);
    console.log(`\n🔑 Admin Login Credentials:`);
    console.log(`Email: john@example.com`);
    console.log(`Password: password123`);
    console.log(`\n👥 User Login Credentials:`);
    console.log(`Email: alice@example.com`);
    console.log(`Password: password123`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the seed function
connectDB().then(() => {
  seedDatabase();
});
