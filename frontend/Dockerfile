#-----BASE------#

FROM node:18-alpine AS base

WORKDIR /frontend

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile


#----BUILD------#

FROM node:18-alpine AS build

WORKDIR /frontend

COPY --from=base /frontend/node_modules ./node_modules

COPY . .

RUN yarn build

#----PRODUCTION----#
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /frontend/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx","-g","daemon off;"]

