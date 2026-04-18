# SkillLink Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copy application code
COPY . .

# Don't copy client folder (handled separately)
# Create required directories
RUN mkdir -p logs public/uploads/profiles public/uploads/products public/uploads/documents public/uploads/shops

# Expose backend port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5005/api || exit 1

CMD ["node", "app.js"]
