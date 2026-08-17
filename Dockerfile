FROM node:24-slim AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json ./
RUN pnpm install --frozen-lockfile --offline

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_MAPTILER_KEY
ARG NEXT_PUBLIC_MAPBOX_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ORY_SDK_URL
ENV NEXT_PUBLIC_MAPTILER_KEY=$NEXT_PUBLIC_MAPTILER_KEY
ENV NEXT_PUBLIC_MAPBOX_KEY=$NEXT_PUBLIC_MAPBOX_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ORY_SDK_URL=$NEXT_PUBLIC_ORY_SDK_URL

RUN corepack enable && corepack prepare pnpm@10 --activate && pnpm run build

# Stage 3: Production server
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nonroot
EXPOSE 3000
CMD ["server.js"]
