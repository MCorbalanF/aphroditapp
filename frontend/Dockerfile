# ========= BUILD STAGE =========
FROM node:20-alpine AS builder

WORKDIR /app


# 👇 Define args
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_APP_NAME
ARG EXPO_PUBLIC_APP_VERSION
# 👇 Convertir a env accesible para Expo
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_APP_NAME=$EXPO_PUBLIC_APP_NAME
ENV EXPO_PUBLIC_APP_VERSION=$EXPO_PUBLIC_APP_VERSION


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