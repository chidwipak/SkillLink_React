const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const Booking = require("../models/Booking")
const User = require("../models/User")
const Service = require("../models/Service")

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
  await Booking.deleteMany({})
  await User.deleteMany({})
  await Service.deleteMany({})
})

describe("Booking Model", () => {
  let customer, worker, service

  beforeEach(async () => {
    customer = await new User({
      name: "Customer",
      email: "customer@test.com",
      password: "hashed",
      phone: "1234567890",
      role: "customer",
    }).save()

    worker = await new User({
      name: "Worker",
      email: "worker@test.com",
      password: "hashed",
      phone: "0987654321",
      role: "worker",
    }).save()

    service = await new Service({
      name: "Plumbing Repair",
      category: "plumber",
      description: "Fix leaky pipes",
      price: 500,
    }).save()
  })

  test("should create a booking with valid data", async () => {
    const booking = await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date("2026-05-01"),
      time: "10:00 AM",
      address: "123 Main St, Hyderabad",
      price: 500,
    }).save()

    expect(booking._id).toBeDefined()
    expect(booking.status).toBe("pending")
    expect(booking.price).toBe(500)
  })

  test("should default status to pending", async () => {
    const booking = await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "10:00 AM",
      address: "Test Address",
      price: 300,
    }).save()

    expect(booking.status).toBe("pending")
  })

  test("should update booking status", async () => {
    const booking = await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "2:00 PM",
      address: "Test Address",
      price: 700,
    }).save()

    booking.status = "accepted"
    const updated = await booking.save()
    expect(updated.status).toBe("accepted")
  })

  test("should track updatedAt on save", async () => {
    const booking = await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "3:00 PM",
      address: "Test",
      price: 400,
    }).save()

    const firstUpdate = booking.updatedAt

    // Small delay
    await new Promise((r) => setTimeout(r, 100))
    booking.status = "completed"
    const updated = await booking.save()
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(firstUpdate.getTime())
  })

  test("should query bookings by customer", async () => {
    await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "10:00 AM",
      address: "Addr 1",
      price: 500,
    }).save()

    await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "2:00 PM",
      address: "Addr 2",
      price: 600,
    }).save()

    const bookings = await Booking.find({ customer: customer._id })
    expect(bookings).toHaveLength(2)
  })

  test("should query bookings by worker and status", async () => {
    const b1 = await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "10:00 AM",
      address: "Addr",
      price: 500,
      status: "pending",
    }).save()

    const b2 = await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "2:00 PM",
      address: "Addr",
      price: 600,
      status: "accepted",
    }).save()

    const pending = await Booking.find({ worker: worker._id, status: "pending" })
    expect(pending).toHaveLength(1)
    expect(pending[0].price).toBe(500)

    const accepted = await Booking.find({ worker: worker._id, status: "accepted" })
    expect(accepted).toHaveLength(1)
    expect(accepted[0].price).toBe(600)
  })

  test("should populate customer reference", async () => {
    await new Booking({
      customer: customer._id,
      worker: worker._id,
      service: service._id,
      date: new Date(),
      time: "10:00 AM",
      address: "Test",
      price: 500,
    }).save()

    const booking = await Booking.findOne()
      .populate("customer", "name email")

    expect(booking.customer.name).toBe("Customer")
    expect(booking.customer.email).toBe("customer@test.com")
  })
})
