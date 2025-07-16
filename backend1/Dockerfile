#Backend

#-----BASE-----#
FROM node:18-alpine as base

WORKDIR /backend1

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

#----BUILD------#
FROM node:18-alpine AS build

WORKDIR /backend1

COPY --from=base /backend1/node_modules ./node_modules

COPY . .

CMD ["sh","yarn.sh"]

# # ----- FINAL STAGE: Slim runtime image -----

# FROM node:18-alpine AS production

# WORKDIR /backend1

# RUN rm -rf yarn.sh Dockerfile .dockerignores

# CMD ["sh","yarn.sh"]

