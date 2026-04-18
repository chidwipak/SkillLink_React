const Redis = require("ioredis")

let redisClient = null
let isRedisConnected = false

const connectRedis = () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("Redis: Max retries reached, falling back to in-memory cache")
          return null // Stop retrying
        }
        return Math.min(times * 200, 2000)
      },
      lazyConnect: true,
    })

    redisClient.on("connect", () => {
      isRedisConnected = true
      console.log("✅ Redis connected successfully")
    })

    redisClient.on("error", (err) => {
      isRedisConnected = false
      if (err.code !== "ECONNREFUSED") {
        console.error("Redis error:", err.message)
      }
    })

    redisClient.on("close", () => {
      isRedisConnected = false
    })

    // Attempt connection (non-blocking)
    redisClient.connect().catch(() => {
      console.warn("⚠️  Redis not available, using in-memory cache fallback")
      isRedisConnected = false
    })
  } catch (err) {
    console.warn("⚠️  Redis initialization failed, using in-memory cache fallback")
    isRedisConnected = false
  }
}

const getRedisClient = () => redisClient
const isConnected = () => isRedisConnected

// Cache helper methods with Redis + fallback
const inMemoryFallback = new Map()

const cacheGet = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key)
      return data ? JSON.parse(data) : null
    } catch {
      // Fallback to in-memory
    }
  }
  const cached = inMemoryFallback.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  inMemoryFallback.delete(key)
  return null
}

const cacheSet = async (key, data, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setex(key, ttlSeconds, JSON.stringify(data))
      return
    } catch {
      // Fallback to in-memory
    }
  }
  // In-memory fallback with size limit
  if (inMemoryFallback.size >= 500) {
    const oldestKey = inMemoryFallback.keys().next().value
    inMemoryFallback.delete(oldestKey)
  }
  inMemoryFallback.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000,
  })
}

const cacheDel = async (pattern) => {
  if (isRedisConnected && redisClient) {
    try {
      if (pattern === "*") {
        await redisClient.flushdb()
      } else {
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) {
          await redisClient.del(...keys)
        }
      }
      return
    } catch {
      // Fallback
    }
  }
  if (pattern === "*") {
    inMemoryFallback.clear()
  } else {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"))
    for (const key of inMemoryFallback.keys()) {
      if (regex.test(key)) inMemoryFallback.delete(key)
    }
  }
}

const getCacheInfo = async () => {
  const info = {
    backend: isRedisConnected ? "redis" : "in-memory",
    connected: isRedisConnected,
  }
  if (isRedisConnected && redisClient) {
    try {
      const redisInfo = await redisClient.info("memory")
      const usedMemory = redisInfo.match(/used_memory_human:(.+)/)?.[1]?.trim()
      const dbSize = await redisClient.dbsize()
      info.entries = dbSize
      info.memory = usedMemory
    } catch {
      info.entries = 0
    }
  } else {
    info.entries = inMemoryFallback.size
  }
  return info
}

module.exports = {
  connectRedis,
  getRedisClient,
  isConnected,
  cacheGet,
  cacheSet,
  cacheDel,
  getCacheInfo,
}
