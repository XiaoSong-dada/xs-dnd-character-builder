FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# 站点信息构建期注入（由 docker-compose build args 传入，未配置则为空）
ARG VITE_AUTHOR_NAME
ARG VITE_GITHUB_URL
ARG VITE_AUTHOR_TAGLINE
ARG VITE_APP_VERSION
ARG VITE_UMAMI_SCRIPT_URL
ARG VITE_UMAMI_WEBSITE_ID
ARG VITE_UMAMI_DOMAINS
ARG VITE_SITE_URL
ARG VITE_SITE_IMAGE
ENV VITE_AUTHOR_NAME=$VITE_AUTHOR_NAME \
    VITE_GITHUB_URL=$VITE_GITHUB_URL \
    VITE_AUTHOR_TAGLINE=$VITE_AUTHOR_TAGLINE \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_UMAMI_SCRIPT_URL=$VITE_UMAMI_SCRIPT_URL \
    VITE_UMAMI_WEBSITE_ID=$VITE_UMAMI_WEBSITE_ID \
    VITE_UMAMI_DOMAINS=$VITE_UMAMI_DOMAINS \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_SITE_IMAGE=$VITE_SITE_IMAGE

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
