FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# 站点信息构建期注入（由 docker-compose build args 传入，未配置则为空）
ARG VITE_AUTHOR_NAME
ARG VITE_GITHUB_URL
ARG VITE_AUTHOR_TAGLINE
ARG VITE_UMAMI_SCRIPT_URL
ARG VITE_UMAMI_WEBSITE_ID
ARG VITE_UMAMI_DOMAINS
ARG VITE_SITE_URL
ARG VITE_SITE_IMAGE
ARG VITE_TIP_WECHAT_QR_URL
ARG VITE_TIP_ALIPAY_QR_URL
ENV VITE_AUTHOR_NAME=$VITE_AUTHOR_NAME \
    VITE_GITHUB_URL=$VITE_GITHUB_URL \
    VITE_AUTHOR_TAGLINE=$VITE_AUTHOR_TAGLINE \
    VITE_UMAMI_SCRIPT_URL=$VITE_UMAMI_SCRIPT_URL \
    VITE_UMAMI_WEBSITE_ID=$VITE_UMAMI_WEBSITE_ID \
    VITE_UMAMI_DOMAINS=$VITE_UMAMI_DOMAINS \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_SITE_IMAGE=$VITE_SITE_IMAGE \
    VITE_TIP_WECHAT_QR_URL=$VITE_TIP_WECHAT_QR_URL \
    VITE_TIP_ALIPAY_QR_URL=$VITE_TIP_ALIPAY_QR_URL

COPY app/package.json app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建上下文为仓库根：docs/ 是物品目录的 Markdown 审计源，构建期生成需要
COPY app/ .
COPY docs/ ../docs/
RUN pnpm build

FROM nginx:1.27-alpine AS runtime

COPY app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
