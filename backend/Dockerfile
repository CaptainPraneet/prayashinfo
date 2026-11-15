
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Backend port
EXPOSE 4000

# Start backend
CMD ["node", "server.js"]
