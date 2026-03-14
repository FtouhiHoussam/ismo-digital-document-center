# ── Backend Dockerfile ────────────────────────────────────────────────────────
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Create upload directories
RUN mkdir -p uploads/justificatifs uploads/documents

EXPOSE 5000

# Copy and use entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]
