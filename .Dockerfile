FROM node:18-alpine

WORKDIR /app

COPY /dist ./dist
COPY package.json .

RUN yarn install

EXPOSE 4173

CMD yarn preview --host=0.0.0.0
