FROM node:alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]



FROM node:alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY  . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]