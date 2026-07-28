# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Clean cache and run a strict clean install using package-lock.json
RUN npm cache clean --force && npm ci

# Copy all project files and build
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]