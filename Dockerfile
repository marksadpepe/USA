FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ARG SERVER_PORT=4000
ENV SERVER_PORT=${SERVER_PORT}
EXPOSE ${SERVER_PORT}

CMD npm run db:generate && npm run db:push && npm run start:dev
