# Stage 1: Bygning af appen
FROM node:21.7.1 AS build

WORKDIR /app

# Kopiér package.json og package-lock.json for at installere afhængigheder
COPY package*.json ./

RUN npm install

# Kopiér resten af projektfilerne
COPY . .

# Byg React appen til produktion
RUN npm run build

# Stage 2: Server det byggede output
FROM nginx:alpine

# Kopiér bygget output fra build-stadiet til Nginx HTML-mappen
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
