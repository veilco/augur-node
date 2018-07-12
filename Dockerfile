FROM node:8 as builder

WORKDIR /app/

COPY wait-for-url.sh wait-for-url.sh
COPY config.json config.json
COPY tsconfig.json tsconfig.json
COPY certs certs

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN git init && yarn --pure-lockfile && rm -rf .git

COPY test test
COPY proto proto
COPY src src

RUN yarn build
RUN yarn pack

COPY knexfile.js knexfile.js

FROM node:8
EXPOSE 9001
WORKDIR /app/

# ie. the "yarn pack" seems to exclude node_modules, which is why it's copied separately
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/augur-node*.tgz /app
RUN tar xzf augur-node*.tgz && mv package/* . && rm -rf package

COPY docker-entrypoint.sh docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
