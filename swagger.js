const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SkillLink API Documentation",
      version: "1.0.0",
      description: "Complete API documentation for SkillLink - Home Services & Supplies Platform. This API powers authentication, bookings, orders, payments, delivery, reviews, notifications, admin, verifier dashboards and more.",
      contact: {
        name: "SkillLink Team",
      },
    },
    servers: [
      {
        url: "http://localhost:5005",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        // ─── User Schema ───
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            phone: { type: "string", example: "9876543210" },
            role: { type: "string", enum: ["customer", "worker", "seller", "delivery", "admin", "verifier"] },
            verification_status: { type: "string", enum: ["Pending", "Approved", "Rejected"] },
            profilePicture: { type: "string" },
            isEmailVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ─── Service Schema ───
        Service: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Fan Installation" },
            category: { type: "string", enum: ["electrician", "plumber", "carpenter"] },
            description: { type: "string" },
            price: { type: "number", example: 500 },
            duration: { type: "number", example: 60 },
            image: { type: "string" },
          },
        },
        // ─── Worker Schema ───
        Worker: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            serviceCategory: { type: "string", enum: ["electrician", "plumber", "carpenter"] },
            skills: { type: "array", items: { type: "string" } },
            experience: { type: "number" },
            rating: { type: "number" },
            isAvailable: { type: "boolean" },
            isVerified: { type: "boolean" },
            jobsCompleted: { type: "number" },
          },
        },
        // ─── Booking Schema ───
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            customer: { type: "string" },
            worker: { type: "string" },
            service: { type: "string" },
            date: { type: "string", format: "date-time" },
            time: { type: "string", example: "10:00 AM" },
            address: { type: "object" },
            status: { type: "string", enum: ["pending", "accepted", "rejected", "in-progress", "in_progress", "completed", "cancelled"] },
            price: { type: "number" },
            notes: { type: "string" },
          },
        },
        // ─── Product Schema ───
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "LED Bulb 9W" },
            brand: { type: "string", example: "Philips" },
            category: { type: "string", enum: ["electrical", "plumbing", "carpentry"] },
            description: { type: "string" },
            price: { type: "number", example: 150 },
            stock: { type: "number", example: 50 },
            images: { type: "array", items: { type: "string" } },
            seller: { type: "string" },
            rating: { type: "number" },
          },
        },
        // ─── Order Schema ───
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            orderNumber: { type: "string" },
            customer: { type: "string" },
            items: { type: "array", items: { type: "object" } },
            totalAmount: { type: "number" },
            status: { type: "string", enum: ["pending", "confirmed", "assigned_delivery", "out_for_delivery", "delivered", "cancelled"] },
            shippingAddress: { type: "object" },
            deliveryOTP: { type: "string" },
          },
        },
        // ─── Payment Schema ───
        Payment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            relatedId: { type: "string" },
            relatedModel: { type: "string", enum: ["Booking", "Order"] },
            amount: { type: "number" },
            status: { type: "string", enum: ["pending", "processing", "completed", "failed", "refunded"] },
            razorpayOrderId: { type: "string" },
          },
        },
        // ─── Notification Schema ───
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            title: { type: "string" },
            message: { type: "string" },
            type: { type: "string", enum: ["info", "success", "warning", "error", "booking", "order", "payment", "delivery"] },
            isRead: { type: "boolean" },
            link: { type: "string" },
          },
        },
        // ─── Seller Schema ───
        Seller: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            businessName: { type: "string" },
            shopName: { type: "string" },
            categories: { type: "array", items: { type: "string" } },
            rating: { type: "number" },
            isVerified: { type: "boolean" },
          },
        },
        // ─── Common Responses ───
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        PaginationInfo: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            pages: { type: "integer" },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "API health check" },
      { name: "Auth", description: "Authentication & user management" },
      { name: "Services", description: "Service listings and categories" },
      { name: "Bookings", description: "Service booking management" },
      { name: "Supplies (Products)", description: "Product/supplies management" },
      { name: "Orders", description: "Order management" },
      { name: "Payments", description: "Payment processing" },
      { name: "Reviews", description: "Reviews for workers, products, sellers" },
      { name: "Notifications", description: "User notifications" },
      { name: "Dashboard", description: "Role-based dashboard stats" },
      { name: "Delivery", description: "Delivery person operations" },
      { name: "Workers", description: "Worker availability management" },
      { name: "Admin", description: "Admin panel operations" },
      { name: "Verifier", description: "User verification management" },
      { name: "Search", description: "Global search" },
      { name: "Metrics", description: "System performance metrics" },
    ],
    paths: {},
  },
  apis: ["./routes/*.js"],
}

// ═══════════════════════════════════════════════════
//  Build paths programmatically (all API endpoints)
// ═══════════════════════════════════════════════════
const paths = options.definition.paths

// ─── Health ───
paths["/api/health"] = {
  get: {
    tags: ["Health"],
    summary: "API health check",
    responses: { 200: { description: "API is running", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, timestamp: { type: "string" } } } } } } },
  },
}

// ─── Auth Routes ───
paths["/api/auth/register"] = {
  post: {
    tags: ["Auth"], summary: "Register a new user", description: "Supports customer, worker, seller, delivery roles. Accepts multipart form data for profile picture and documents.",
    requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["name", "email", "password", "phone", "role"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", format: "password" }, phone: { type: "string" }, role: { type: "string", enum: ["customer", "worker", "seller", "delivery"] }, serviceCategory: { type: "string", description: "Worker only" }, skills: { type: "string", description: "Worker only, comma-separated" }, experience: { type: "number", description: "Worker only" }, businessName: { type: "string", description: "Seller only" }, categories: { type: "string", description: "Seller only, comma-separated" }, profilePicture: { type: "string", format: "binary" } } } } } },
    responses: { 201: { description: "Registration successful" }, 400: { description: "Validation error" } },
  },
}
paths["/api/auth/verify-email"] = { post: { tags: ["Auth"], summary: "Verify email with OTP", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "otp"], properties: { email: { type: "string" }, otp: { type: "string" } } } } } }, responses: { 200: { description: "Email verified" }, 400: { description: "Invalid OTP" } } } }
paths["/api/auth/resend-otp"] = { post: { tags: ["Auth"], summary: "Resend OTP to email", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string" } } } } } }, responses: { 200: { description: "OTP resent" } } } }
paths["/api/auth/login"] = { post: { tags: ["Auth"], summary: "Login user", description: "Returns JWT access token and refresh token", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", example: "admin@skilllink.com" }, password: { type: "string", example: "admin123" } } } } } }, responses: { 200: { description: "Login successful with tokens" }, 401: { description: "Invalid credentials" }, 403: { description: "Account pending/rejected" } } } }
paths["/api/auth/refresh-token"] = { post: { tags: ["Auth"], summary: "Refresh access token", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } } }, responses: { 200: { description: "New tokens issued" } } } }
paths["/api/auth/forgot-password"] = { post: { tags: ["Auth"], summary: "Request password reset", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" } } } } } }, responses: { 200: { description: "Reset link sent" } } } }
paths["/api/auth/reset-password"] = { post: { tags: ["Auth"], summary: "Reset password with token", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, password: { type: "string" } } } } } }, responses: { 200: { description: "Password reset successful" } } } }
paths["/api/auth/profile"] = {
  get: { tags: ["Auth"], summary: "Get current user profile", security: [{ bearerAuth: [] }], responses: { 200: { description: "User profile with role-specific data" } } },
  put: { tags: ["Auth"], summary: "Update user profile", security: [{ bearerAuth: [] }], requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" }, address: { type: "string", description: "JSON string" }, profilePicture: { type: "string", format: "binary" } } } } } }, responses: { 200: { description: "Profile updated" } } },
}
paths["/api/auth/logout"] = { post: { tags: ["Auth"], summary: "Logout user", security: [{ bearerAuth: [] }], responses: { 200: { description: "Logged out" } } } }

// ─── Services Routes ───
paths["/api/services"] = { get: { tags: ["Services"], summary: "Get all services", parameters: [{ name: "category", in: "query", schema: { type: "string", enum: ["electrician", "plumber", "carpenter"] } }, { name: "search", in: "query", schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer", default: 20 } }, { name: "page", in: "query", schema: { type: "integer", default: 1 } }], responses: { 200: { description: "List of services with pagination" } } } }
paths["/api/services/categories"] = { get: { tags: ["Services"], summary: "Get unique service categories", responses: { 200: { description: "Array of category names" } } } }
paths["/api/services/{id}"] = { get: { tags: ["Services"], summary: "Get service by ID with available workers", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Service details with workers" }, 404: { description: "Service not found" } } } }
paths["/api/services/category/{category}/workers"] = { get: { tags: ["Services"], summary: "Get workers by service category", parameters: [{ name: "category", in: "path", required: true, schema: { type: "string" } }, { name: "sortBy", in: "query", schema: { type: "string", default: "rating" } }], responses: { 200: { description: "Workers list" } } } }
paths["/api/services/workers/{id}"] = { get: { tags: ["Services"], summary: "Get worker details", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Worker details" } } } }

// ─── Bookings Routes ───
paths["/api/bookings"] = {
  post: { tags: ["Bookings"], summary: "Create a booking", security: [{ bearerAuth: [] }], description: "Customer only. Books a specific worker for a service.", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["service", "worker", "date", "time", "address"], properties: { service: { type: "string", description: "Service ID" }, worker: { type: "string", description: "Worker ID" }, date: { type: "string", format: "date" }, time: { type: "string" }, address: { type: "object" }, notes: { type: "string" } } } } } }, responses: { 201: { description: "Booking created" }, 400: { description: "Validation error" } } },
  get: { tags: ["Bookings"], summary: "Get user bookings", security: [{ bearerAuth: [] }], parameters: [{ name: "status", in: "query", schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer" } }, { name: "page", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "Bookings list" } } },
}
paths["/api/bookings/broadcast"] = { post: { tags: ["Bookings"], summary: "Create broadcast booking to all workers", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { service: { type: "string" }, workers: { type: "array", items: { type: "string" } }, date: { type: "string" }, time: { type: "string" }, address: { type: "object" }, notes: { type: "string" } } } } } }, responses: { 201: { description: "Broadcast booking created" } } } }
paths["/api/bookings/{id}"] = { get: { tags: ["Bookings"], summary: "Get booking by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Booking details" } } } }
paths["/api/bookings/{id}/status"] = { patch: { tags: ["Bookings"], summary: "Update booking status (worker/admin)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, notes: { type: "string" } } } } } }, responses: { 200: { description: "Status updated" } } } }
paths["/api/bookings/{id}/accept"] = { put: { tags: ["Bookings"], summary: "Worker accepts booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Booking accepted" } } } }
paths["/api/bookings/{id}/reject"] = { put: { tags: ["Bookings"], summary: "Worker rejects booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } }, responses: { 200: { description: "Booking rejected with alternative workers" } } } }
paths["/api/bookings/{id}/start"] = { put: { tags: ["Bookings"], summary: "Worker starts booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Booking started" } } } }
paths["/api/bookings/{id}/complete"] = { put: { tags: ["Bookings"], summary: "Worker completes booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { finalPrice: { type: "number" } } } } } }, responses: { 200: { description: "Booking completed" } } } }
paths["/api/bookings/{id}/cancel"] = { put: { tags: ["Bookings"], summary: "Customer cancels booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } }, responses: { 200: { description: "Booking cancelled" } } } }
paths["/api/bookings/{id}/alternatives"] = { get: { tags: ["Bookings"], summary: "Get alternative workers for rejected booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Alternative workers list" } } } }
paths["/api/bookings/{id}/rebook"] = { post: { tags: ["Bookings"], summary: "Rebook with alternative worker", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { workerId: { type: "string" } } } } } }, responses: { 201: { description: "Rebooked" } } } }
paths["/api/bookings/{id}/review"] = { post: { tags: ["Bookings"], summary: "Add review to booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { rating: { type: "number" }, review: { type: "string" } } } } } }, responses: { 200: { description: "Review added" } } } }
paths["/api/bookings/{id}/share-location"] = { post: { tags: ["Bookings"], summary: "Share live location for booking", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { latitude: { type: "number" }, longitude: { type: "number" } } } } } }, responses: { 200: { description: "Location shared" } } } }

// ─── Supplies (Products) Routes ───
paths["/api/supplies"] = {
  get: { tags: ["Supplies (Products)"], summary: "Get all products", parameters: [{ name: "category", in: "query", schema: { type: "string" } }, { name: "search", in: "query", schema: { type: "string" } }, { name: "minPrice", in: "query", schema: { type: "number" } }, { name: "maxPrice", in: "query", schema: { type: "number" } }], responses: { 200: { description: "Products list" } } },
  post: { tags: ["Supplies (Products)"], summary: "Create product (seller)", security: [{ bearerAuth: [] }], requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["name", "brand", "category", "price"], properties: { name: { type: "string" }, brand: { type: "string" }, category: { type: "string", enum: ["electrical", "plumbing", "carpentry"] }, description: { type: "string" }, price: { type: "number" }, stock: { type: "integer" }, images: { type: "array", items: { type: "string", format: "binary" } } } } } } }, responses: { 201: { description: "Product created" } } },
}
paths["/api/supplies/my-products"] = { get: { tags: ["Supplies (Products)"], summary: "Get seller's own products", security: [{ bearerAuth: [] }], responses: { 200: { description: "Seller's products" } } } }
paths["/api/supplies/unique"] = { get: { tags: ["Supplies (Products)"], summary: "Get unique products grouped by name", responses: { 200: { description: "Unique products" } } } }
paths["/api/supplies/csv-upload"] = { post: { tags: ["Supplies (Products)"], summary: "Bulk upload products via CSV", security: [{ bearerAuth: [] }], requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { csvFile: { type: "string", format: "binary" } } } } } }, responses: { 201: { description: "Products uploaded" } } } }
paths["/api/supplies/{id}"] = {
  get: { tags: ["Supplies (Products)"], summary: "Get product by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Product details" } } },
  put: { tags: ["Supplies (Products)"], summary: "Update product (seller)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Product updated" } } },
  delete: { tags: ["Supplies (Products)"], summary: "Delete product (seller)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Product deleted" } } },
}
paths["/api/supplies/{id}/price"] = { put: { tags: ["Supplies (Products)"], summary: "Update product price", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { price: { type: "number" } } } } } }, responses: { 200: { description: "Price updated" } } } }
paths["/api/supplies/{id}/stock"] = { put: { tags: ["Supplies (Products)"], summary: "Toggle product stock status", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { inStock: { type: "boolean" } } } } } }, responses: { 200: { description: "Stock toggled" } } } }

// ─── Orders Routes ───
paths["/api/orders"] = {
  post: { tags: ["Orders"], summary: "Create order", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["items", "shippingAddress"], properties: { items: { type: "array", items: { type: "object", properties: { productId: { type: "string" }, quantity: { type: "integer" } } } }, shippingAddress: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" }, street: { type: "string" }, city: { type: "string" }, state: { type: "string" }, zipCode: { type: "string" } } }, paymentMethod: { type: "string" } } } } } }, responses: { 201: { description: "Order created" } } },
  get: { tags: ["Orders"], summary: "Get customer orders", security: [{ bearerAuth: [] }], parameters: [{ name: "status", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Orders list" } } },
}
paths["/api/orders/seller"] = { get: { tags: ["Orders"], summary: "Get seller's orders", security: [{ bearerAuth: [] }], responses: { 200: { description: "Seller orders" } } } }
paths["/api/orders/{id}"] = { get: { tags: ["Orders"], summary: "Get order by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Order details" } } } }
paths["/api/orders/{id}/status"] = { put: { tags: ["Orders"], summary: "Update order status (seller)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, notes: { type: "string" } } } } } }, responses: { 200: { description: "Status updated" } } } }
paths["/api/orders/{id}/cancel"] = { put: { tags: ["Orders"], summary: "Cancel order (customer)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } }, responses: { 200: { description: "Order cancelled" } } } }
paths["/api/orders/{id}/track"] = { get: { tags: ["Orders"], summary: "Track order", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Tracking info" } } } }
paths["/api/orders/verify-pickup-otp"] = { post: { tags: ["Orders"], summary: "Verify pickup OTP (seller)", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { orderId: { type: "string" }, otp: { type: "string" } } } } } }, responses: { 200: { description: "OTP verified" } } } }
paths["/api/orders/{orderId}/pickup-otps"] = { get: { tags: ["Orders"], summary: "Get pickup OTPs for order (seller)", security: [{ bearerAuth: [] }], parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Pickup OTPs" } } } }

// ─── Payments Routes ───
paths["/api/payment/webhook"] = { post: { tags: ["Payments"], summary: "Razorpay webhook handler", responses: { 200: { description: "Webhook processed" } } } }
paths["/api/payment/booking"] = { post: { tags: ["Payments"], summary: "Create booking payment", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { bookingId: { type: "string" } } } } } }, responses: { 200: { description: "Payment order created" } } } }
paths["/api/payment/order"] = { post: { tags: ["Payments"], summary: "Create order payment", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { orderId: { type: "string" } } } } } }, responses: { 200: { description: "Payment order created" } } } }
paths["/api/payment/verify"] = { post: { tags: ["Payments"], summary: "Verify payment", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { paymentId: { type: "string" }, razorpayPaymentId: { type: "string" }, razorpayOrderId: { type: "string" }, razorpaySignature: { type: "string" } } } } } }, responses: { 200: { description: "Payment verified" } } } }
paths["/api/payment"] = { get: { tags: ["Payments"], summary: "Get payment history", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }, { name: "status", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Payment history" } } } }
paths["/api/payment/{id}"] = { get: { tags: ["Payments"], summary: "Get payment by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Payment details" } } } }
paths["/api/payment/{paymentId}/refund"] = { post: { tags: ["Payments"], summary: "Refund payment (admin)", security: [{ bearerAuth: [] }], parameters: [{ name: "paymentId", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { amount: { type: "number" }, reason: { type: "string" } } } } } }, responses: { 200: { description: "Payment refunded" } } } }

// ─── Reviews Routes ───
paths["/api/reviews/worker"] = { post: { tags: ["Reviews"], summary: "Add worker review", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["workerId", "rating"], properties: { workerId: { type: "string" }, rating: { type: "number", minimum: 1, maximum: 5 }, comment: { type: "string" }, bookingId: { type: "string" } } } } } }, responses: { 200: { description: "Review added" } } } }
paths["/api/reviews/product"] = { post: { tags: ["Reviews"], summary: "Add product review", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["productId", "rating"], properties: { productId: { type: "string" }, rating: { type: "number" }, comment: { type: "string" }, orderId: { type: "string" } } } } } }, responses: { 200: { description: "Review added" } } } }
paths["/api/reviews/seller"] = { post: { tags: ["Reviews"], summary: "Add seller review", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sellerId", "rating"], properties: { sellerId: { type: "string" }, rating: { type: "number" }, comment: { type: "string" }, orderId: { type: "string" } } } } } }, responses: { 200: { description: "Review added" } } } }
paths["/api/reviews/worker/{workerId}"] = { get: { tags: ["Reviews"], summary: "Get worker reviews", parameters: [{ name: "workerId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Worker reviews" } } } }
paths["/api/reviews/product/{productId}"] = { get: { tags: ["Reviews"], summary: "Get product reviews", parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Product reviews" } } } }
paths["/api/reviews/seller/{sellerId}"] = { get: { tags: ["Reviews"], summary: "Get seller reviews", parameters: [{ name: "sellerId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Seller reviews" } } } }

// ─── Notifications Routes ───
paths["/api/notifications"] = { get: { tags: ["Notifications"], summary: "Get user notifications", security: [{ bearerAuth: [] }], parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "unreadOnly", in: "query", schema: { type: "boolean" } }], responses: { 200: { description: "Notifications list" } } } }
paths["/api/notifications/unread-count"] = { get: { tags: ["Notifications"], summary: "Get unread notification count", security: [{ bearerAuth: [] }], responses: { 200: { description: "Unread count" } } } }
paths["/api/notifications/mark-all-read"] = { patch: { tags: ["Notifications"], summary: "Mark all notifications as read", security: [{ bearerAuth: [] }], responses: { 200: { description: "All marked read" } } } }
paths["/api/notifications/cleanup/read"] = { delete: { tags: ["Notifications"], summary: "Delete all read notifications", security: [{ bearerAuth: [] }], responses: { 200: { description: "Read notifications deleted" } } } }
paths["/api/notifications/{id}/read"] = { patch: { tags: ["Notifications"], summary: "Mark notification as read", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Marked read" } } } }
paths["/api/notifications/{id}"] = { delete: { tags: ["Notifications"], summary: "Delete notification", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } } }

// ─── Dashboard Routes ───
paths["/api/dashboard/customer/stats"] = { get: { tags: ["Dashboard"], summary: "Get customer dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "Customer stats" } } } }
paths["/api/dashboard/worker/stats"] = { get: { tags: ["Dashboard"], summary: "Get worker dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "Worker stats with earnings, bookings, reviews" } } } }
paths["/api/dashboard/seller/stats"] = { get: { tags: ["Dashboard"], summary: "Get seller dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "Seller stats with products, orders, revenue" } } } }
paths["/api/dashboard/seller/profile"] = { get: { tags: ["Dashboard"], summary: "Get seller profile", security: [{ bearerAuth: [] }], responses: { 200: { description: "Seller profile" } } } }
paths["/api/dashboard/seller/shop-settings"] = { put: { tags: ["Dashboard"], summary: "Update seller shop settings", security: [{ bearerAuth: [] }], requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { shopName: { type: "string" }, businessDescription: { type: "string" }, profilePicture: { type: "string", format: "binary" }, shopExteriorImage: { type: "string", format: "binary" }, shopInteriorImage: { type: "string", format: "binary" } } } } } }, responses: { 200: { description: "Settings updated" } } } }
paths["/api/dashboard/delivery/stats"] = { get: { tags: ["Dashboard"], summary: "Get delivery dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "Delivery stats" } } } }
paths["/api/dashboard/admin/stats"] = { get: { tags: ["Dashboard"], summary: "Get admin dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "Admin overview stats" } } } }

// ─── Delivery Routes ───
paths["/api/delivery/stats"] = { get: { tags: ["Delivery"], summary: "Delivery person dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "Delivery stats" } } } }
paths["/api/delivery/requests"] = { get: { tags: ["Delivery"], summary: "Get pending delivery requests", security: [{ bearerAuth: [] }], responses: { 200: { description: "Pending requests" } } } }
paths["/api/delivery/active"] = { get: { tags: ["Delivery"], summary: "Get active delivery", security: [{ bearerAuth: [] }], responses: { 200: { description: "Active delivery details" } } } }
paths["/api/delivery/history"] = { get: { tags: ["Delivery"], summary: "Get delivery history", security: [{ bearerAuth: [] }], responses: { 200: { description: "Delivery history" } } } }
paths["/api/delivery/availability"] = { put: { tags: ["Delivery"], summary: "Toggle delivery availability", security: [{ bearerAuth: [] }], responses: { 200: { description: "Availability toggled" } } } }
paths["/api/delivery/accept/{orderId}"] = { put: { tags: ["Delivery"], summary: "Accept delivery request", security: [{ bearerAuth: [] }], parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Delivery accepted" } } } }
paths["/api/delivery/deliver/{orderId}"] = { put: { tags: ["Delivery"], summary: "Verify OTP and complete delivery", security: [{ bearerAuth: [] }], parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { otp: { type: "string" } } } } } }, responses: { 200: { description: "Delivery completed" } } } }
paths["/api/delivery/assign/{orderId}"] = { put: { tags: ["Delivery"], summary: "Seller assigns order to delivery", security: [{ bearerAuth: [] }], parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Assigned to delivery" } } } }
paths["/api/delivery/handed/{orderId}"] = { put: { tags: ["Delivery"], summary: "Seller marks order as handed to delivery", security: [{ bearerAuth: [] }], parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Handed to delivery" } } } }
paths["/api/delivery/info/{orderId}"] = { get: { tags: ["Delivery"], summary: "Get delivery person info for order (customer)", security: [{ bearerAuth: [] }], parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Delivery person info" } } } }

// ─── Workers Routes ───
paths["/api/workers/availability"] = { put: { tags: ["Workers"], summary: "Update worker availability", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { isAvailable: { type: "boolean" } } } } } }, responses: { 200: { description: "Availability updated" } } } }

// ─── Admin Routes ───
paths["/api/admin/verifications/pending"] = { get: { tags: ["Admin"], summary: "Get pending verifications", security: [{ bearerAuth: [] }], responses: { 200: { description: "Pending workers, sellers, delivery persons" } } } }
paths["/api/admin/workers/{id}/verify"] = { put: { tags: ["Admin"], summary: "Verify/reject worker", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { approved: { type: "boolean" }, rejectionReason: { type: "string" } } } } } }, responses: { 200: { description: "Worker verified/rejected" } } } }
paths["/api/admin/sellers/{id}/verify"] = { put: { tags: ["Admin"], summary: "Verify/reject seller", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { approved: { type: "boolean" }, rejectionReason: { type: "string" } } } } } }, responses: { 200: { description: "Seller verified/rejected" } } } }
paths["/api/admin/delivery/{id}/verify"] = { put: { tags: ["Admin"], summary: "Verify/reject delivery person", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { approved: { type: "boolean" }, rejectionReason: { type: "string" } } } } } }, responses: { 200: { description: "Delivery verified/rejected" } } } }
paths["/api/admin/users"] = { get: { tags: ["Admin"], summary: "Get all users", security: [{ bearerAuth: [] }], parameters: [{ name: "role", in: "query", schema: { type: "string" } }, { name: "verified", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "Users list" } } } }
paths["/api/admin/users/approved"] = { get: { tags: ["Admin"], summary: "Get approved users", security: [{ bearerAuth: [] }], responses: { 200: { description: "Approved users" } } } }
paths["/api/admin/users/rejected"] = { get: { tags: ["Admin"], summary: "Get rejected users", security: [{ bearerAuth: [] }], responses: { 200: { description: "Rejected users" } } } }
paths["/api/admin/users/{userId}"] = { get: { tags: ["Admin"], summary: "Get user details with role stats", security: [{ bearerAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Comprehensive user details" } } } }
paths["/api/admin/users/{userId}/status"] = { put: { tags: ["Admin"], summary: "Update user status", security: [{ bearerAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { isActive: { type: "boolean" }, isEmailVerified: { type: "boolean" } } } } } }, responses: { 200: { description: "Status updated" } } } }
paths["/api/admin/users/{userId}"] = { ...paths["/api/admin/users/{userId}"], delete: { tags: ["Admin"], summary: "Delete user", security: [{ bearerAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User deleted" } } } }
paths["/api/admin/analytics"] = { get: { tags: ["Admin"], summary: "Get system analytics", security: [{ bearerAuth: [] }], parameters: [{ name: "startDate", in: "query", schema: { type: "string", format: "date" } }, { name: "endDate", in: "query", schema: { type: "string", format: "date" } }], responses: { 200: { description: "System analytics" } } } }

// ─── Verifier Routes ───
paths["/api/verifier/stats"] = { get: { tags: ["Verifier"], summary: "Get verifier dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "Verifier stats" } } } }
paths["/api/verifier/pending"] = { get: { tags: ["Verifier"], summary: "Get all pending users", security: [{ bearerAuth: [] }], responses: { 200: { description: "Pending users" } } } }
paths["/api/verifier/users/{userId}"] = { get: { tags: ["Verifier"], summary: "Get user details for review", security: [{ bearerAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User details with role profile" } } } }
paths["/api/verifier/users/{userId}/approve"] = { put: { tags: ["Verifier"], summary: "Approve user", security: [{ bearerAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User approved" } } } }
paths["/api/verifier/users/{userId}/decline"] = { put: { tags: ["Verifier"], summary: "Decline/reject user", security: [{ bearerAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["feedback"], properties: { feedback: { type: "string" } } } } } }, responses: { 200: { description: "User declined" } } } }
paths["/api/verifier/users-approved"] = { get: { tags: ["Verifier"], summary: "Get all approved users", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of approved users" } } } }
paths["/api/verifier/users-rejected"] = { get: { tags: ["Verifier"], summary: "Get all rejected users", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of rejected users" } } } }

// ─── Search Route ───
paths["/api/search"] = { get: { tags: ["Search"], summary: "Global search across services, products, workers", parameters: [{ name: "query", in: "query", required: true, schema: { type: "string" } }, { name: "type", in: "query", schema: { type: "string", enum: ["all", "services", "products", "workers"] } }], responses: { 200: { description: "Search results" } } } }

// ─── Metrics Route ───
paths["/api/metrics"] = { get: { tags: ["Metrics"], summary: "Get system performance metrics", responses: { 200: { description: "Performance and cache metrics" } } } }

const swaggerSpec = swaggerJsdoc(options)

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .download-url-wrapper .select-label { color: #e94560; }
      .swagger-ui .info .title { color: #1a1a2e; }
      .swagger-ui .scheme-container { background: #f8f9fa; }
    `,
    customSiteTitle: "SkillLink API Docs",
    customfavIcon: "/images/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
      tagsSorter: "alpha",
    },
  }))

  // JSON spec endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
  })

  console.log("📚 Swagger API Docs available at http://localhost:5005/api-docs")
}

module.exports = { setupSwagger, swaggerSpec }
