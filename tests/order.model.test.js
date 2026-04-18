const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const Order = require("../models/Order")
const User = require("../models/User")
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
  await Order.deleteMany({})
  await User.deleteMany({})
  await Product.deleteMany({})
})

describe("Order Model", () => {
  let customer, product

  beforeEach(async () => {
    customer = await new User({
      name: "Test Customer",
      email: "ordercustomer@test.com",
      password: "hashed",
      phone: "1234567890",
      role: "customer",
    }).save()

    product = await new Product({
      name: "Wire Set",
      category: "electrical",
      price: 250,
      stock: 50,
      seller: new mongoose.Types.ObjectId(),
      brand: "TestBrand",
    }).save()
  })

  test("should create an order with valid data", async () => {
    const order = await new Order({
      customer: customer._id,
      items: [
        {
          product: product._id,
          quantity: 2,
          price: 250,
          seller: new mongoose.Types.ObjectId(),
        },
      ],
      totalAmount: 500,
      shippingAddress: {
        name: "Test",
        phone: "1234567890",
        street: "123 St",
        city: "Hyderabad",
        state: "Telangana",
        zipCode: "500001",
      },
    }).save()

    expect(order._id).toBeDefined()
    expect(order.status).toBe("pending")
    expect(order.totalAmount).toBe(500)
  })

  test("should auto-generate orderNumber on save", async () => {
    const sellerId = new mongoose.Types.ObjectId()
    const order = await new Order({
      customer: customer._id,
      items: [{ product: product._id, quantity: 1, price: 250, seller: sellerId }],
      totalAmount: 250,
      shippingAddress: { name: "Test", phone: "123", street: "St", city: "City", state: "State", zipCode: "500001" },
    }).save()

    expect(order.orderNumber).toBeDefined()
    expect(order.orderNumber).toMatch(/^ORD-/)
  })

  test("should auto-generate orderId on save", async () => {
    const sellerId = new mongoose.Types.ObjectId()
    const order = await new Order({
      customer: customer._id,
      items: [{ product: product._id, quantity: 1, price: 250, seller: sellerId }],
      totalAmount: 250,
      shippingAddress: { name: "Test", phone: "123", street: "St", city: "City", state: "State", zipCode: "500001" },
    }).save()

    expect(order.orderId).toBeDefined()
    expect(typeof order.orderId).toBe("string")
  })

  test("should default status to pending", async () => {
    const sellerId = new mongoose.Types.ObjectId()
    const order = await new Order({
      customer: customer._id,
      items: [{ product: product._id, quantity: 1, price: 250, seller: sellerId }],
      totalAmount: 250,
      shippingAddress: { name: "Test", phone: "123", street: "St", city: "City", state: "State", zipCode: "500001" },
    }).save()

    expect(order.status).toBe("pending")
    expect(order.paymentStatus).toBe("pending")
  })

  test("should query orders by customer and status", async () => {
    const sellerId = new mongoose.Types.ObjectId()
    await new Order({
      customer: customer._id,
      items: [{ product: product._id, quantity: 1, price: 250, seller: sellerId }],
      totalAmount: 250,
      status: "pending",
      shippingAddress: { name: "T", phone: "123", street: "A", city: "C", state: "S", zipCode: "1" },
    }).save()

    await new Order({
      customer: customer._id,
      items: [{ product: product._id, quantity: 2, price: 250, seller: sellerId }],
      totalAmount: 500,
      status: "confirmed",
      shippingAddress: { name: "T", phone: "123", street: "A", city: "C", state: "S", zipCode: "1" },
    }).save()

    const pending = await Order.find({ customer: customer._id, status: "pending" })
    expect(pending).toHaveLength(1)
    expect(pending[0].totalAmount).toBe(250)

    const confirmed = await Order.find({ customer: customer._id, status: "confirmed" })
    expect(confirmed).toHaveLength(1)
    expect(confirmed[0].totalAmount).toBe(500)
  })

  test("should handle multiple items in an order", async () => {
    const sellerId = new mongoose.Types.ObjectId()
    const product2 = await new Product({
      name: "LED Bulbs",
      category: "electrical",
      price: 150,
      stock: 100,
      seller: sellerId,
      brand: "Philips",
    }).save()

    const order = await new Order({
      customer: customer._id,
      items: [
        { product: product._id, quantity: 2, price: 250, seller: sellerId },
        { product: product2._id, quantity: 3, price: 150, seller: sellerId },
      ],
      totalAmount: 950,
      shippingAddress: { name: "T", phone: "123", street: "A", city: "C", state: "S", zipCode: "1" },
    }).save()

    expect(order.items).toHaveLength(2)
    expect(order.totalAmount).toBe(950)
  })

  test("should update order status through lifecycle", async () => {
    const sellerId = new mongoose.Types.ObjectId()
    const order = await new Order({
      customer: customer._id,
      items: [{ product: product._id, quantity: 1, price: 250, seller: sellerId }],
      totalAmount: 250,
      shippingAddress: { name: "T", phone: "123", street: "A", city: "C", state: "S", zipCode: "1" },
    }).save()

    const statuses = ["confirmed", "assigned_delivery", "delivered"]
    for (const status of statuses) {
      order.status = status
      const updated = await order.save()
      expect(updated.status).toBe(status)
    }
  })
})
