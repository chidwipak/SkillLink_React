const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const Product = require("../models/Product")

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  await Product.deleteMany({})
})

describe("Product Model", () => {
  const sellerId = new mongoose.Types.ObjectId()

  test("should create a product with valid data", async () => {
    const product = await new Product({
      name: "Wire Set",
      category: "electrical",
      price: 250,
      stock: 50,
      seller: sellerId,
      brand: "TestBrand",
    }).save()

    expect(product._id).toBeDefined()
    expect(product.name).toBe("Wire Set")
    expect(product.category).toBe("electrical")
    expect(product.price).toBe(250)
    expect(product.stock).toBe(50)
  })

  test("should enforce required fields", async () => {
    const product = new Product({})
    await expect(product.save()).rejects.toThrow()
  })

  test("should filter products by category", async () => {
    await Product.insertMany([
      { name: "Wire", category: "electrical", price: 100, stock: 10, seller: sellerId, brand: "BrandA" },
      { name: "Pipe", category: "plumbing", price: 200, stock: 20, seller: sellerId, brand: "BrandB" },
      { name: "Bulb", category: "electrical", price: 50, stock: 30, seller: sellerId, brand: "BrandA" },
    ])

    const electrical = await Product.find({ category: "electrical" })
    expect(electrical).toHaveLength(2)

    const plumbing = await Product.find({ category: "plumbing" })
    expect(plumbing).toHaveLength(1)
  })

  test("should filter products by price range", async () => {
    await Product.insertMany([
      { name: "Item1", category: "electrical", price: 100, stock: 10, seller: sellerId, brand: "BrandA" },
      { name: "Item2", category: "electrical", price: 500, stock: 10, seller: sellerId, brand: "BrandA" },
      { name: "Item3", category: "electrical", price: 1000, stock: 10, seller: sellerId, brand: "BrandA" },
    ])

    const affordable = await Product.find({ price: { $lte: 500 } })
    expect(affordable).toHaveLength(2)
  })

  test("should sort products by price", async () => {
    await Product.insertMany([
      { name: "Expensive", category: "electrical", price: 1000, stock: 10, seller: sellerId, brand: "BrandA" },
      { name: "Cheap", category: "electrical", price: 50, stock: 10, seller: sellerId, brand: "BrandB" },
      { name: "Medium", category: "electrical", price: 500, stock: 10, seller: sellerId, brand: "BrandC" },
    ])

    const sorted = await Product.find().sort({ price: 1 })
    expect(sorted[0].name).toBe("Cheap")
    expect(sorted[2].name).toBe("Expensive")
  })

  test("should filter by seller", async () => {
    const otherSeller = new mongoose.Types.ObjectId()
    await Product.insertMany([
      { name: "P1", category: "electrical", price: 100, stock: 10, seller: sellerId, brand: "BrandA" },
      { name: "P2", category: "electrical", price: 200, stock: 10, seller: otherSeller, brand: "BrandB" },
      { name: "P3", category: "plumbing", price: 300, stock: 10, seller: sellerId, brand: "BrandC" },
    ])

    const sellerProducts = await Product.find({ seller: sellerId })
    expect(sellerProducts).toHaveLength(2)
  })

  test("should support text search on name and description", async () => {
    await Product.insertMany([
      { name: "LED Bulb Pack", category: "electrical", description: "Energy efficient lighting", price: 150, stock: 10, seller: sellerId, brand: "Philips" },
      { name: "Copper Wire 5m", category: "electrical", description: "Premium copper wiring", price: 250, stock: 10, seller: sellerId, brand: "Havells" },
      { name: "PVC Pipe", category: "plumbing", description: "Durable plumbing pipe", price: 100, stock: 10, seller: sellerId, brand: "Ashirvad" },
    ])

    // Text index search
    const results = await Product.find({ $text: { $search: "copper wire" } })
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some(r => r.name.includes("Copper"))).toBe(true)
  })
})
