# Railway Dockerfile for Placement CMS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
