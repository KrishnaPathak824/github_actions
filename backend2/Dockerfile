#-----BASE-----#
FROM node:18-alpine AS base

WORKDIR /backend2

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

#----BUILD------#
FROM node:18-alpine AS build

WORKDIR /backend2

COPY --from=base /backend2/node_modules ./node_modules
COPY . .
CMD ["sh","yarn.sh"]


