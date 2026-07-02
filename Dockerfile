# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner (smallest possible image)
FROM node:20-alpine AS runner
WORKDIR /
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]