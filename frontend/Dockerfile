# ========= BUILD STAGE =========
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos SOLO la app
COPY aphroditapp/package.json aphroditapp/package-lock.json* ./

RUN npm install

COPY aphroditapp/ .

# Exportar versión web
RUN npx expo export --platform web


# ========= PRODUCTION STAGE =========
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]