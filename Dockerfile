# ---- Base (no NODE_ENV here so devDeps can install) ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- deps: install with devDependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && apk add --no-cache libc6-compat
COPY package.json ./
COPY yarn.lock* pnpm-lock.yaml* package-lock.json* ./
RUN \
  if [ -f yarn.lock ]; then \
    yarn install --immutable --production=false; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack pnpm install --frozen-lockfile --prod=false; \
  elif [ -f package-lock.json ]; then \
    npm ci --include=dev; \
  else \
    echo "No lockfile found; aborting for reproducibility." && exit 1; \
  fi

# ---- builder: prisma generate + next build (standalone) ----
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client
RUN \
  if [ -f yarn.lock ]; then \
    yarn prisma:generate; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack pnpm prisma:generate; \
  else \
    npm run prisma:generate; \
  fi
# Build Next.js (standalone)
RUN \
  if [ -f yarn.lock ]; then \
    yarn build; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack pnpm build; \
  else \
    npm run build; \
  fi

# ---- runner: minimal prod image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

# Standalone server and assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Include prisma migrations so `prisma migrate deploy` can run in container
COPY --from=builder /app/prisma ./prisma
# Tiny global CLI for migrations
RUN npm i -g prisma@6.13.0

USER 1001
EXPOSE 3000
CMD ["node", "server.js"]
