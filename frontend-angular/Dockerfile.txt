
# Stage 1: Build the Angular app
FROM node:18 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration development

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/frontend-angular/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
