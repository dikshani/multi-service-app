# Stage 1: Build React application
FROM multi-service-web-base:1.0 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build


# Stage 2: Production image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
