# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

############################
# Build stage
############################
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_BASE_URL
ARG VITE_API_KEY

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_API_KEY=${VITE_API_KEY}

RUN npm run build

############################
# Runtime stage (NGINX)
############################
FROM nginx:alpine

# Remove default nginx config (optional but clean)
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
