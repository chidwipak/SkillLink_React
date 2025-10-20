const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("./models/User")
const Worker = require("./models/Worker")
const Seller = require("./models/Seller")
const Service = require("./models/Service")
const Product = require("./models/Product")
const Booking = require("./models/Booking")
const Order = require("./models/Order")
const DeliveryPerson = require("./models/DeliveryPerson")
require("dotenv").config()

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skilllink")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Clear existing data
const clearData = async () => {
  await User.deleteMany({})
  await Worker.deleteMany({})
  await Seller.deleteMany({})
  await Service.deleteMany({})
  await Product.deleteMany({})
  await Booking.deleteMany({})
  await Order.deleteMany({})
  await DeliveryPerson.deleteMany({})
  console.log("Cleared existing data")
}

// Seed Admin
const seedAdmin = async () => {
  const adminPassword = await hashPassword("Admin@123")

  const admin = new User({
    name: "Admin User",
    email: "admin@skilllink.com",
    password: adminPassword,
    phone: "9876543210",
    role: "admin",
    address: {
      street: "123 Admin Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
    },
    profilePicture: "/images/admin-profile.jpg",
    isVerified: true,
    isEmailVerified: true,
  })

  await admin.save()
  console.log("Admin created:", admin.email)
  return admin
}

// Seed Services
const seedServices = async () => {
  const serviceCategories = {
    electrician: [
      { name: "Wiring Installation", price: 500, duration: 120, image: "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Fan Installation", price: 300, duration: 60, image: "https://images.pexels.com/photos/1797418/pexels-photo-1797418.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Switch Board Repair", price: 200, duration: 45, image: "https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Light Fixture Installation", price: 250, duration: 60, image: "https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Circuit Breaker Replacement", price: 400, duration: 90, image: "https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
    ],
    plumber: [
      { name: "Pipe Leak Repair", price: 350, duration: 60, image: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Tap Installation", price: 200, duration: 45, image: "https://images.pexels.com/photos/6419561/pexels-photo-6419561.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Toilet Repair", price: 400, duration: 90, image: "https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Water Heater Installation", price: 800, duration: 180, image: "https://images.pexels.com/photos/6419557/pexels-photo-6419557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Drainage Cleaning", price: 300, duration: 60, image: "https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
    ],
    carpenter: [
      { name: "Furniture Assembly", price: 500, duration: 120, image: "https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Door Repair", price: 400, duration: 90, image: "https://images.pexels.com/photos/3616763/pexels-photo-3616763.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Cabinet Installation", price: 700, duration: 150, image: "https://images.pexels.com/photos/6969866/pexels-photo-6969866.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Wooden Flooring", price: 1200, duration: 240, image: "https://images.pexels.com/photos/4682107/pexels-photo-4682107.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
      { name: "Window Frame Repair", price: 450, duration: 100, image: "https://images.pexels.com/photos/5974398/pexels-photo-5974398.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" },
    ],
  }

  const services = []

  for (const [category, serviceList] of Object.entries(serviceCategories)) {
    for (const service of serviceList) {
      const newService = new Service({
        name: service.name,
        category: category,
        description: `Professional ${service.name} service by experienced ${category}s.`,
        price: service.price,
        duration: service.duration,
        image: service.image,
      })

      await newService.save()
      services.push(newService)
    }
  }

  console.log(`Created ${services.length} services`)
  return services
}

// Worker profile images - unique professional worker photos for each worker
const workerProfileImages = [
  // Electricians (1-5) - professional men
  "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 1
  "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 2
  "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 3
  "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 4
  "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 5
  // Plumbers (6-10) - professional men
  "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 6
  "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 7
  "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 8
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 9
  "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 10
  // Carpenters (11-15) - professional men
  "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 11
  "https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 12
  "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 13
  "https://images.pexels.com/photos/936019/pexels-photo-936019.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 14
  "https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop", // Man 15
]

// Seed Workers
const seedWorkers = async (services) => {
  const workerData = [
    // Electricians
    {
      name: "Rajesh Kumar",
      email: "rajesh@skilllink.com",
      password: "Worker@123",
      phone: "9876543201",
      category: "electrician",
      experience: 5,
      skills: ["Wiring", "Fan Installation", "Circuit Repair"],
    },
    {
      name: "Sunil Sharma",
      email: "sunil@skilllink.com",
      password: "Worker@123",
      phone: "9876543202",
      category: "electrician",
      experience: 8,
      skills: ["Panel Board", "Industrial Wiring", "Troubleshooting"],
    },
    {
      name: "Amit Patel",
      email: "amit@skilllink.com",
      password: "Worker@123",
      phone: "9876543203",
      category: "electrician",
      experience: 3,
      skills: ["Home Wiring", "Light Installation", "Switch Repair"],
    },
    {
      name: "Vikram Singh",
      email: "vikram@skilllink.com",
      password: "Worker@123",
      phone: "9876543204",
      category: "electrician",
      experience: 10,
      skills: ["Commercial Wiring", "Generator Installation", "Electrical Maintenance"],
    },
    {
      name: "Pradeep Joshi",
      email: "pradeep@skilllink.com",
      password: "Worker@123",
      phone: "9876543205",
      category: "electrician",
      experience: 6,
      skills: ["Solar Panel Installation", "Smart Home Wiring", "Energy Audits"],
    },

    // Plumbers
    {
      name: "Mohan Das",
      email: "mohan@skilllink.com",
      password: "Worker@123",
      phone: "9876543206",
      category: "plumber",
      experience: 7,
      skills: ["Pipe Fitting", "Leak Repair", "Bathroom Plumbing"],
    },
    {
      name: "Ravi Verma",
      email: "ravi@skilllink.com",
      password: "Worker@123",
      phone: "9876543207",
      category: "plumber",
      experience: 4,
      skills: ["Toilet Installation", "Drainage Cleaning", "Tap Repair"],
    },
    {
      name: "Sanjay Gupta",
      email: "sanjay@skilllink.com",
      password: "Worker@123",
      phone: "9876543208",
      category: "plumber",
      experience: 6,
      skills: ["Water Heater Installation", "Pipe Replacement", "Sewer Line Repair"],
    },
    {
      name: "Prakash Joshi",
      email: "prakash@skilllink.com",
      password: "Worker@123",
      phone: "9876543209",
      category: "plumber",
      experience: 9,
      skills: ["Commercial Plumbing", "Water Filtration", "Pump Installation"],
    },
    {
      name: "Karan Malhotra",
      email: "karan@skilllink.com",
      password: "Worker@123",
      phone: "9876543210",
      category: "plumber",
      experience: 5,
      skills: ["Gas Line Installation", "Boiler Repair", "Bathroom Renovation"],
    },

    // Carpenters
    {
      name: "Dinesh Tiwari",
      email: "dinesh@skilllink.com",
      password: "Worker@123",
      phone: "9876543211",
      category: "carpenter",
      experience: 12,
      skills: ["Furniture Making", "Wood Carving", "Cabinet Installation"],
    },
    {
      name: "Ramesh Yadav",
      email: "ramesh@skilllink.com",
      password: "Worker@123",
      phone: "9876543212",
      category: "carpenter",
      experience: 5,
      skills: ["Door Installation", "Window Repair", "Shelving"],
    },
    {
      name: "Kishore Kumar",
      email: "kishore@skilllink.com",
      password: "Worker@123",
      phone: "9876543213",
      category: "carpenter",
      experience: 8,
      skills: ["Wooden Flooring", "Staircase Building", "Custom Furniture"],
    },
    {
      name: "Vijay Mishra",
      email: "vijay@skilllink.com",
      password: "Worker@123",
      phone: "9876543214",
      category: "carpenter",
      experience: 7,
      skills: ["Kitchen Cabinets", "Furniture Repair", "Wood Finishing"],
    },
    {
      name: "Naveen Reddy",
      email: "naveen@skilllink.com",
      password: "Worker@123",
      phone: "9876543215",
      category: "carpenter",
      experience: 9,
      skills: ["Custom Furniture Design", "Antique Restoration", "Deck Building"],
    },
  ]

  const workers = []

  for (const data of workerData) {
    // Create user
    const hashedPassword = await hashPassword(data.password)

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "worker",
      address: {
        street: `${Math.floor(Math.random() * 100) + 1} Worker Street`,
        city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"][Math.floor(Math.random() * 5)],
        state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana"][Math.floor(Math.random() * 5)],
        zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
        country: "India",
      },
      profilePicture: workerProfileImages[workers.length % workerProfileImages.length],
      isVerified: true,
      isEmailVerified: true,
    })

    await user.save()

    // Get services for this category
    const categoryServices = services.filter((service) => service.category === data.category)

    // Create pricing array with different prices for each worker
    const pricing = categoryServices.map((service, index) => {
      // Add some variation to prices based on worker's experience
      const priceVariation = data.experience * 10
      const basePrice = service.price

      // Calculate a unique price for each worker
      const uniquePrice = basePrice + priceVariation + index * 20

      return {
        serviceName: service.name,
        price: uniquePrice,
      }
    })

    // Create worker
    const worker = new Worker({
      user: user._id,
      serviceCategory: data.category,
      skills: data.skills,
      experience: data.experience,
      professionalEmail: data.email,
      professionalPhone: data.phone,
      idNumber: `ID${Math.floor(Math.random() * 10000)}`,
      pricing: pricing,
      rating: (Math.random() * 3 + 2).toFixed(1), // Random rating between 2 and 5
      earnings: Math.floor(Math.random() * 50000),
      jobsCompleted: Math.floor(Math.random() * 50),
      isAvailable: true,
      isVerified: true,
      availability: {
        monday: { isAvailable: true, from: "09:00", to: "18:00" },
        tuesday: { isAvailable: true, from: "09:00", to: "18:00" },
        wednesday: { isAvailable: true, from: "09:00", to: "18:00" },
        thursday: { isAvailable: true, from: "09:00", to: "18:00" },
        friday: { isAvailable: true, from: "09:00", to: "18:00" },
        saturday: { isAvailable: Math.random() > 0.5, from: "09:00", to: "14:00" },
        sunday: { isAvailable: Math.random() > 0.7, from: "10:00", to: "14:00" },
      },
    })

    await worker.save()
    workers.push({ user, worker })
  }

  console.log(`Created ${workers.length} workers`)
  return workers
}

// Seed Sellers
const seedSellers = async () => {
  const sellerData = [
    {
      name: "Mahesh Traders",
      ownerName: "Mahesh Shah",
      email: "mahesh@skilllink.com",
      password: "Seller@123",
      phone: "9876543216",
      categories: ["electrical", "plumbing"],
      yearsEstablished: 12,
      description: "Leading supplier of electrical and plumbing materials with quality products at competitive prices.",
    },
    {
      name: "Sharma Hardware",
      ownerName: "Vishal Sharma",
      email: "vishal@skilllink.com",
      password: "Seller@123",
      phone: "9876543217",
      categories: ["carpentry", "electrical"],
      yearsEstablished: 8,
      description:
        "One-stop shop for all your carpentry and electrical needs. We stock a wide range of tools and materials.",
    },
    {
      name: "Green Solutions",
      ownerName: "Anita Desai",
      email: "anita@skilllink.com",
      password: "Seller@123",
      phone: "9876543218",
      categories: ["electrical", "plumbing", "carpentry"],
      yearsEstablished: 7,
      description: "Eco-friendly home improvement products and sustainable building materials for conscious consumers.",
    },
  ]

  const sellers = []

  for (const data of sellerData) {
    // Create user
    const hashedPassword = await hashPassword(data.password)

    const user = new User({
      name: data.ownerName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "seller",
      address: {
        street: `${Math.floor(Math.random() * 100) + 1} Business Street`,
        city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"][Math.floor(Math.random() * 5)],
        state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana"][Math.floor(Math.random() * 5)],
        zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
        country: "India",
      },
      profilePicture: `/images/sellers/seller-${sellers.length + 1}.jpg`,
      isVerified: true,
      isEmailVerified: true,
    })

    await user.save()

    // Create seller profile
    const seller = new Seller({
      user: user._id,
      businessName: data.name,
      description: data.description,
      businessEmail: data.email,
      businessPhone: data.phone,
      gstNumber: `GST${Math.floor(Math.random() * 10000000000)}`,
      yearsEstablished: data.yearsEstablished,
      shopImages: {
        exterior: `/images/shops/shop-exterior-${sellers.length + 1}.jpg`,
        interior: `/images/shops/shop-interior-${sellers.length + 1}.jpg`,
      },
      categories: data.categories,
      rating: (Math.random() * 3 + 2).toFixed(1), // Random rating between 2 and 5
      earnings: Math.floor(Math.random() * 200000),
      totalSales: Math.floor(Math.random() * 500),
      isVerified: true,
      bankDetails: {
        accountName: data.name,
        accountNumber: `${Math.floor(Math.random() * 10000000000)}`,
        ifscCode: `IFSC${Math.floor(Math.random() * 10000)}`,
        bankName: ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra Bank"][Math.floor(Math.random() * 5)],
      },
    })

    await seller.save()
    sellers.push({ user, seller })
  }

  console.log(`Created ${sellers.length} sellers`)
  return sellers
}

// Seed Products - Each seller gets all products from their categories with their own prices
const seedProducts = async (sellers) => {
  // Default products per category with base prices and images
  const defaultProducts = {
    electrical: [
      { name: "LED Bulb 9W", brand: "Philips", basePrice: 150, description: "Energy efficient 9W LED bulb with bright white light. Long lasting up to 15000 hours.", image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=300&h=300&fit=crop&q=80" },
      { name: "Ceiling Fan 48 inch", brand: "Havells", basePrice: 2500, description: "48 inch ceiling fan with high air delivery and energy efficient motor.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&q=80" },
      { name: "Extension Cord 5m", brand: "Anchor", basePrice: 350, description: "5 meter heavy duty extension cord with surge protection and multiple sockets.", image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop&q=80" },
      { name: "Switch Board 8-way", brand: "Havells", basePrice: 450, description: "8-way modular switch board with modern design and safety features.", image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=300&h=300&fit=crop&q=80" },
      { name: "MCB 32A", brand: "Legrand", basePrice: 300, description: "32 Amp Miniature Circuit Breaker for electrical safety and overload protection.", image: "https://images.unsplash.com/photo-1545259742-b4fd8fea67e8?w=300&h=300&fit=crop&q=80" },
      { name: "Copper Wire 1.5 sq mm (90m)", brand: "Finolex", basePrice: 1800, description: "90 meters of 1.5 sq mm copper wire. ISI certified for house wiring.", image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=300&h=300&fit=crop&q=80" },
      { name: "LED Tube Light 20W", brand: "Crompton", basePrice: 250, description: "20W LED tube light with cool daylight. Direct replacement for conventional tubes.", image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=300&h=300&fit=crop&q=80" },
      { name: "Modular Socket", brand: "Anchor", basePrice: 100, description: "6A modular socket with shutter for safety. Fits standard modular plates.", image: "https://images.unsplash.com/photo-1558618047-f4f8e9f8f8e4?w=300&h=300&fit=crop&q=80" },
      { name: "Voltage Stabilizer 5KVA", brand: "V-Guard", basePrice: 3500, description: "5KVA voltage stabilizer for AC and heavy appliances. Wide input range.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop&q=80" },
      { name: "Electric Drill Machine", brand: "Bosch", basePrice: 2800, description: "500W electric drill machine with variable speed and reverse function.", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=300&fit=crop&q=80" },
    ],
    plumbing: [
      { name: "PVC Pipe 4 inch (10ft)", brand: "Astral", basePrice: 450, description: "4 inch PVC pipe, 10 feet length. Ideal for drainage and sewage systems.", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=300&h=300&fit=crop&q=80" },
      { name: "Basin Mixer Tap", brand: "Jaquar", basePrice: 1500, description: "Single lever basin mixer tap with chrome finish and ceramic cartridge.", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&h=300&fit=crop&q=80" },
      { name: "Overhead Shower", brand: "Kohler", basePrice: 800, description: "8 inch overhead rain shower with chrome finish and anti-lime system.", image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=300&h=300&fit=crop&q=80" },
      { name: "Flush Tank", brand: "Hindware", basePrice: 1200, description: "Dual flush tank with 3/6 liter flush. Water saving design.", image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&h=300&fit=crop&q=80" },
      { name: "Water Filter RO", brand: "Kent", basePrice: 8500, description: "RO water purifier with UV+UF filtration. 8 liter storage capacity.", image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=300&h=300&fit=crop&q=80" },
      { name: "Pipe Wrench 14 inch", brand: "Taparia", basePrice: 650, description: "14 inch heavy duty pipe wrench with adjustable jaw.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=300&fit=crop&q=80" },
      { name: "CPVC Pipe Cutter", brand: "Astral", basePrice: 350, description: "Ratchet type CPVC/PVC pipe cutter for clean cuts up to 42mm.", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=300&fit=crop&q=80" },
      { name: "Wash Basin", brand: "Parryware", basePrice: 2200, description: "Wall hung wash basin with overflow. Modern oval design.", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&h=300&fit=crop&q=80" },
      { name: "Toilet Seat Cover", brand: "Hindware", basePrice: 1800, description: "Soft close toilet seat cover with quick release hinges.", image: "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=300&h=300&fit=crop&q=80" },
      { name: "Water Heater 15L", brand: "Havells", basePrice: 6500, description: "15 liter storage water heater with glass lined tank. 5 star rated.", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=300&fit=crop&q=80" },
    ],
    carpentry: [
      { name: "Teak Wood Plank (6ft)", brand: "Premium", basePrice: 1500, description: "6 feet teak wood plank, 1 inch thick. Seasoned and termite treated.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&q=80" },
      { name: "Nails Assorted Pack (1kg)", brand: "Stanley", basePrice: 200, description: "1kg assorted nails pack with various sizes for general carpentry work.", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300&h=300&fit=crop&q=80" },
      { name: "Claw Hammer", brand: "Stanley", basePrice: 450, description: "16oz claw hammer with fiberglass handle. Ideal for nailing and pulling.", image: "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=300&h=300&fit=crop&q=80" },
      { name: "Hand Saw 18 inch", brand: "Taparia", basePrice: 550, description: "18 inch hand saw with hardened teeth for smooth cutting.", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=300&fit=crop&q=80" },
      { name: "Wood Chisel Set (5pc)", brand: "Stanley", basePrice: 850, description: "Set of 5 wood chisels with hardwood handles. Sizes 6mm to 25mm.", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=300&fit=crop&q=80" },
      { name: "Wood Glue 1L", brand: "Fevicol", basePrice: 300, description: "1 liter wood glue. Strong bond for all types of wood.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=300&fit=crop&q=80" },
      { name: "Sandpaper Pack (20 sheets)", brand: "Norton", basePrice: 250, description: "20 sheets assorted grit sandpaper. 80, 120, 180, 240 grit included.", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=300&fit=crop&q=80" },
      { name: "Wood Varnish 1L", brand: "Asian Paints", basePrice: 400, description: "1 liter wood varnish with glossy finish. Protects and beautifies wood.", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop&q=80" },
      { name: "Measuring Tape 5m", brand: "Stanley", basePrice: 200, description: "5 meter steel measuring tape with auto-lock and belt clip.", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=300&fit=crop&q=80" },
      { name: "Electric Wood Planer", brand: "Bosch", basePrice: 4500, description: "82mm electric wood planer with 600W motor and dust collection bag.", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=300&fit=crop&q=80" },
    ],
  }

  const products = []

  // For EACH seller, create products for their categories
  for (const { seller } of sellers) {
    const sellerCategories = seller.categories

    for (const category of sellerCategories) {
      const categoryProducts = defaultProducts[category]
      
      if (!categoryProducts) continue

      for (const productData of categoryProducts) {
        // Add price variation for each seller (-10% to +15% of base price)
        const priceVariation = 1 + (Math.random() * 0.25 - 0.10) // 0.90 to 1.15
        const sellerPrice = Math.round(productData.basePrice * priceVariation / 50) * 50 // Round to nearest 50

        const product = new Product({
          name: productData.name,
          brand: productData.brand,
          category: category,
          description: productData.description,
          specifications: [
            { key: "Brand", value: productData.brand },
            { key: "Category", value: category.charAt(0).toUpperCase() + category.slice(1) },
            { key: "Warranty", value: `${Math.floor(Math.random() * 2) + 1} year` },
            { key: "Made In", value: "India" },
          ],
          price: sellerPrice,
          stock: Math.floor(Math.random() * 40) + 10, // Random stock between 10 and 50
          images: [productData.image], // Product image from Unsplash
          seller: seller._id,
          rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3 and 5
          createdAt: new Date(),
        })

        await product.save()
        products.push(product)
      }
    }
  }

  console.log(`Created ${products.length} products (${products.length / sellers.length} avg per seller)`)
  return products
}

// Seed Customers
const seedCustomers = async () => {
  const customerData = [
    {
      name: "Ananya Sharma",
      email: "ananya@example.com",
      password: "Customer@123",
      phone: "9876543219",
    },
    {
      name: "Rohan Mehta",
      email: "rohan@example.com",
      password: "Customer@123",
      phone: "9876543220",
    },
    {
      name: "Neha Gupta",
      email: "neha@example.com",
      password: "Customer@123",
      phone: "9876543221",
    },
  ]

  const customers = []

  for (const data of customerData) {
    // Create user
    const hashedPassword = await hashPassword(data.password)

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "customer",
      address: {
        street: `${Math.floor(Math.random() * 100) + 1} Customer Street`,
        city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"][Math.floor(Math.random() * 5)],
        state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana"][Math.floor(Math.random() * 5)],
        zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
        country: "India",
      },
      profilePicture: `/images/customers/customer-${customers.length + 1}.jpg`,
      isVerified: true,
      isEmailVerified: true,
      addresses: [
        {
          street: `${Math.floor(Math.random() * 100) + 1} Home Street`,
          city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"][Math.floor(Math.random() * 5)],
          state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana"][Math.floor(Math.random() * 5)],
          zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
          country: "India",
        },
        {
          street: `${Math.floor(Math.random() * 100) + 1} Office Street`,
          city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"][Math.floor(Math.random() * 5)],
          state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana"][Math.floor(Math.random() * 5)],
          zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
          country: "India",
        },
      ],
    })

    await user.save()
    customers.push(user)
  }

  console.log(`Created ${customers.length} customers`)
  return customers
}

// Seed Delivery Persons
const seedDeliveryPersons = async () => {
  const deliveryPassword = await hashPassword("Delivery@123")

  const deliveryPersonsData = [
    {
      name: "Raju Kumar",
      email: "raju@skilllink.com",
      phone: "9876501234",
      vehicleType: "bike",
      vehicleNumber: "MH-01-AB-1234",
    },
    {
      name: "Suresh Yadav",
      email: "suresh@skilllink.com",
      phone: "9876505678",
      vehicleType: "scooter",
      vehicleNumber: "MH-02-CD-5678",
    },
  ]

  const deliveryPersons = []

  for (const data of deliveryPersonsData) {
    const user = new User({
      name: data.name,
      email: data.email,
      password: deliveryPassword,
      phone: data.phone,
      role: "delivery",
      address: {
        street: `${Math.floor(Math.random() * 100) + 1} Delivery Street`,
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
      },
      profilePicture: `/images/delivery/delivery-${deliveryPersons.length + 1}.jpg`,
      isVerified: true,
      isEmailVerified: true,
    })

    await user.save()

    const deliveryPerson = new DeliveryPerson({
      user: user._id,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      isAvailable: true,
      isVerified: true,
      rating: (Math.random() * 1 + 4).toFixed(1), // Rating between 4 and 5
      totalRatings: Math.floor(Math.random() * 50) + 10,
      totalDeliveries: Math.floor(Math.random() * 100) + 20,
      earnings: Math.floor(Math.random() * 5000) + 1000,
    })

    await deliveryPerson.save()
    deliveryPersons.push({ user, deliveryPerson })
  }

  console.log(`Created ${deliveryPersons.length} delivery persons`)
  return deliveryPersons
}

// Main seeding function
const seedDatabase = async () => {
  try {
    await clearData()

    const admin = await seedAdmin()
    const services = await seedServices()
    const workers = await seedWorkers(services)
    const sellers = await seedSellers()
    const products = await seedProducts(sellers)
    const customers = await seedCustomers()
    const deliveryPersons = await seedDeliveryPersons()

    console.log("\n=== SEEDING COMPLETED SUCCESSFULLY ===\n")

    console.log("Admin Login:")
    console.log("Email: admin@skilllink.com")
    console.log("Password: Admin@123")

    console.log("\nWorker Logins:")
    workers.forEach((w) => {
      console.log(`${w.user.name} (${w.worker.serviceCategory}) - Email: ${w.user.email}, Password: Worker@123`)
    })

    console.log("\nSeller Logins:")
    sellers.forEach((s) => {
      console.log(`${s.seller.businessName} - Email: ${s.user.email}, Password: Seller@123`)
    })

    console.log("\nDelivery Person Logins:")
    deliveryPersons.forEach((d) => {
      console.log(`${d.user.name} (${d.deliveryPerson.vehicleType}) - Email: ${d.user.email}, Password: Delivery@123`)
    })

    console.log("\nCustomer Logins:")
    customers.forEach((c) => {
      console.log(`${c.name} - Email: ${c.email}, Password: Customer@123`)
    })

    mongoose.disconnect()
  } catch (error) {
    console.error("Error seeding database:", error)
    mongoose.disconnect()
  }
}

// Run the seeding
seedDatabase()
