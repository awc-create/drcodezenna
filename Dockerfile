# ---- Base images ----
FROM node:22-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
RUN corepack enable
RUN apk add --no-cache libc6-compat
COPY package.json ./
COPY yarn.lock* pnpm-lock.yaml* package-lock.json* ./
RUN \
  if [ -f yarn.lock ]; then \
    echo "Installing via Yarn..." && yarn install --immutable; \
  elif [ -f pnpm-lock.yaml ]; then \
    echo "Installing via PNPM..." && corepack pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    echo "Installing via npm..." && npm ci; \
  else \
    echo "No lockfile found; aborting for reproducibility." && exit 1; \
  fi

# ---- Builder ----
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ✅ Generate Prisma Client *after* schema is present
RUN \
  if [ -f yarn.lock ]; then \
    yarn prisma:generate; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack pnpm prisma:generate; \
  else \
    npm run prisma:generate; \
  fi
# Build Next.js standalone
RUN \
  if [ -f yarn.lock ]; then \
    yarn build; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack pnpm build; \
  else \
    npm run build; \
  fi

# ---- Runner ----
FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER 1001
EXPOSE 3000
CMD ["node", "server.js"]
