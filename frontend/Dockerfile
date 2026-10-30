# Dev image: installs deps at build time, runs `npm run dev` at container
# start so edits to bind-mounted source are picked up (Vite HMR).
FROM node:22.14.0-alpine3.21

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# node_modules is a named volume in compose, which Docker only seeds from the
# image once — sync it on every start so newly added deps show up.
CMD ["sh", "-c", "npm install --no-audit --no-fund && npm run dev"]
