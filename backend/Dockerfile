FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN mv docker.env .env

EXPOSE 3000
CMD ["node", "app.js"]