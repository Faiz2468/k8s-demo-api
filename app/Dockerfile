FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./

FROM node:20-alpine

WORKDIR /usr/src/app

# Pull in patched OS packages (e.g. openssl/libssl3) to close known CVEs
# in the base image before anything else runs.
RUN apk update && apk upgrade --no-cache

COPY --from=builder /usr/src/app ./

# Remove npm's CLI and its bundled internals (tar, minimatch, pacote, sigstore)
# from the runtime image — the app only needs `node` to run, not `npm`.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

EXPOSE 3000

CMD ["node", "index.js"]