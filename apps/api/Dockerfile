FROM node:20-alpine

WORKDIR /app

# Copy package files from api
COPY package.json ./

# Install dependencies (using npm install since no package-lock in api folder)
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]
