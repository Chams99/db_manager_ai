FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source
COPY . .

# Server listens on 5000
EXPOSE 5000

# Use PORT from env for flexibility (default 5000)
ENV PORT=5000

CMD ["node", "index.js"]
