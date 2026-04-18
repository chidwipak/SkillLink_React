const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../middleware/jwt")
const jwt = require("jsonwebtoken")

describe("JWT Middleware", () => {
  const userId = "64f1234567890abcde123456"
  const role = "customer"

  describe("generateAccessToken", () => {
    test("should generate a valid JWT access token", () => {
      const token = generateAccessToken(userId, role)
      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3) // JWT has 3 parts
    })

    test("should contain correct payload", () => {
      const token = generateAccessToken(userId, role)
      const decoded = jwt.decode(token)
      expect(decoded.userId).toBe(userId)
      expect(decoded.role).toBe(role)
    })

    test("should set expiration", () => {
      const token = generateAccessToken(userId, role)
      const decoded = jwt.decode(token)
      expect(decoded.exp).toBeDefined()
      expect(decoded.exp).toBeGreaterThan(decoded.iat)
    })
  })

  describe("generateRefreshToken", () => {
    test("should generate a valid refresh token", () => {
      const token = generateRefreshToken(userId, role)
      expect(token).toBeDefined()
      expect(token.split(".")).toHaveLength(3)
    })

    test("should contain correct payload", () => {
      const token = generateRefreshToken(userId, role)
      const decoded = jwt.decode(token)
      expect(decoded.userId).toBe(userId)
      expect(decoded.role).toBe(role)
    })
  })

  describe("verifyAccessToken", () => {
    test("should verify a valid token", () => {
      const token = generateAccessToken(userId, role)
      const decoded = verifyAccessToken(token)
      expect(decoded).not.toBeNull()
      expect(decoded.userId).toBe(userId)
      expect(decoded.role).toBe(role)
    })

    test("should return null for invalid token", () => {
      const result = verifyAccessToken("invalid.token.here")
      expect(result).toBeNull()
    })

    test("should return null for expired token", () => {
      const secret = process.env.JWT_SECRET || "skilllink-jwt-secret-2025"
      const expiredToken = jwt.sign({ userId, role }, secret, { expiresIn: "0s" })
      // Small delay to ensure expiry
      const result = verifyAccessToken(expiredToken)
      expect(result).toBeNull()
    })

    test("should return null for tampered token", () => {
      const token = generateAccessToken(userId, role)
      const tampered = token.slice(0, -5) + "xxxxx"
      const result = verifyAccessToken(tampered)
      expect(result).toBeNull()
    })
  })

  describe("verifyRefreshToken", () => {
    test("should verify a valid refresh token", () => {
      const token = generateRefreshToken(userId, role)
      const decoded = verifyRefreshToken(token)
      expect(decoded).not.toBeNull()
      expect(decoded.userId).toBe(userId)
    })

    test("should not verify access token as refresh token", () => {
      const accessToken = generateAccessToken(userId, role)
      // Will fail because different secret is used
      const result = verifyRefreshToken(accessToken)
      expect(result).toBeNull()
    })
  })

  describe("Token differentiation", () => {
    test("access and refresh tokens should be different", () => {
      const accessToken = generateAccessToken(userId, role)
      const refreshToken = generateRefreshToken(userId, role)
      expect(accessToken).not.toBe(refreshToken)
    })

    test("tokens for different users should be different", () => {
      const token1 = generateAccessToken("user1", "customer")
      const token2 = generateAccessToken("user2", "customer")
      expect(token1).not.toBe(token2)
    })

    test("tokens for different roles should be different", () => {
      const token1 = generateAccessToken(userId, "customer")
      const token2 = generateAccessToken(userId, "admin")
      expect(token1).not.toBe(token2)
    })
  })
})
