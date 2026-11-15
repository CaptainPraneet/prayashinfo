
FROM node:20-alpine

WORKDIR /app

# Backend package files
COPY package.json package-lock*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend source
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
