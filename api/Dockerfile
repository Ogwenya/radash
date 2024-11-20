FROM node:alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

ENV NODE_ENV=development

EXPOSE 3009

CMD ["npm", "run", "start:dev"]



FROM node:alpine AS production

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

RUN npm run build

COPY --chown=node:node . .

USER node

ENV NODE_ENV=production

EXPOSE 3009

CMD ["npm", "run", "start:prod"]