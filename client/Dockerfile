# Build stage
FROM node:24.10.0-bookworm AS build

WORKDIR /app

ARG VITE_API_URL
ARG PNPM_VERSION=10.15.1

ENV VITE_API_URL=${VITE_API_URL}

COPY package.json pnpm-lock.yaml ./
RUN corepack pnpm@${PNPM_VERSION} install --frozen-lockfile

COPY . .

RUN corepack pnpm@${PNPM_VERSION} run build

# Export stage
FROM scratch AS export

COPY --from=build /app/dist /dist
