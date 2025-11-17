# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage 
# Use unprivileged nginx image to make it compatible with CSH OKD
FROM nginxinc/nginx-unprivileged:stable-alpine

# Remove the user directive from the nginx configuration
RUN sed -i '/^user/d' /etc/nginx/nginx.conf

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]