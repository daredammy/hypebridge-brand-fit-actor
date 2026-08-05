# Specify the parent image from which we build
FROM apify/actor-node:20 AS builder

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci --include=dev

# Copy source code and config
COPY . ./

# Build TypeScript code
RUN npm run build

# Create clean production image
FROM apify/actor-node:20

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy built js files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Run the image as main executable
CMD ["node", "dist/main.js"]
