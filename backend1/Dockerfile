# Use Alpine base image
FROM alpine:3.22

# Set environment variables
ENV NODE_VERSION=22.17.0 \
    YARN_VERSION=1.22.22

# Install dependencies and Node.js
RUN apk add --no-cache curl bash python3 make g++ \
 && curl -fsSL https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz | tar -xJf - -C /usr/local --strip-components=1 \
 && npm install -g yarn@$YARN_VERSION

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Default command
CMD ["node"]

# Set working directory
WORKDIR /App

# Copy dependency files
COPY package*.json ./

# Install Node.js dependencies
RUN yarn install

# Copy app source code
COPY . .

# Install any extra dependencies needed
RUN apk add --no-cache libc6-compat

# Expose port
EXPOSE 3000

# Run app
CMD ["yarn", "start"]
