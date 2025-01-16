FROM node:18.17.0 AS development

# Create app directory
WORKDIR /app_core

COPY package*.json ./

RUN npm install glob rimraf

RUN npm ci

#RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:18.17.0 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app_core

COPY package*.json ./

RUN npm ci

#RUN npm install --only=production

COPY .env ./
COPY locales ./locales

COPY --from=development /app_core/dist ./dist

CMD ["node", "dist/main"]