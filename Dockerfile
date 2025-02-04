# Use an official Node.js image as the base
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Copy environment variables file
COPY .env .env

# Build the Next.js application
RUN npm run build

# Use a lightweight production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app ./

# Ensure .env file is available in the runtime container
COPY .env .env

# Expose port 3000 for Next.js
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]