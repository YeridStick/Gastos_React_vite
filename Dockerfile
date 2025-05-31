FROM node:18 AS build

WORKDIR /app

# Instalar dependencias y construir la aplicación
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Usar NGINX para servir la aplicación
FROM nginx:stable-alpine

# Copiar la configuración de NGINX directamente (sin variables de entorno)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados a la carpeta de NGINX
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8888

CMD ["nginx", "-g", "daemon off;"]
