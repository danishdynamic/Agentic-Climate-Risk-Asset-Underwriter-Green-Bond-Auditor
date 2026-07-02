# Use Node 20 (LTS)
FROM node:20-alpine

WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the default Next.js port
EXPOSE 3000

# Run in development mode
CMD ["npm", "run", "dev"]