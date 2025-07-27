FROM node:22-alpine as prod

WORKDIR /App

COPY package*.json ./
RUN yarn install

COPY . .


RUN apk add --no-cache curl
EXPOSE 3000

CMD ["yarn","start"]
