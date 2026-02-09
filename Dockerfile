# Stage 1: Build
FROM node:24-alpine AS build-stage

WORKDIR /app

# Only copy files needed for install to leverage layer caching
COPY package*.json ./
RUN npm install  

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS prod-stage

# Set environment to production for optimization
ENV NODE_ENV=production

WORKDIR /app

RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy only the compiled output and production-only dependencies
COPY --from=build-stage --chown=node:node /app/dist ./dist
COPY --from=build-stage --chown=node:node  /app/package*.json ./

# Install only production dependencies to keep the image slim
RUN npm install --only=production

# Security: Use the pre-existing 'node' user instead of root
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
