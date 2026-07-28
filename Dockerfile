# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Ensure devDependencies are included
ENV NODE_ENV=development

# 1. Copy source code and package files FIRST
COPY . .

# 2. Run npm install AFTER files are copied
RUN npm install

# 3. Build the Vite app using the local binary directly
RUN npx vite build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]