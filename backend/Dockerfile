# 阶段一：依赖安装与构建
FROM node:20-alpine AS builder

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

WORKDIR /app

# 1. 单独复制 package.json 文件进行依赖安装
# 利用 Docker 的缓存机制，只要 package.json 不变，就不会重新 npm ci
COPY package*.json ./
COPY npm-shrinkwrap.json* ./
COPY pnpm-lock.yaml* ./

# 可选：使用国内镜像源以加速安装
# RUN npm config set registry https://registry.npmmirror.com/

# 使用 npm ci 而不是 npm install
# ci 严格根据 lockfile 安装，能保证依赖一致性和更快的安装速度
RUN npm ci --only=production --ignore-scripts --force

# 2. 复制源码并进行构建
COPY . .
RUN npm run build


# 阶段二：生产运行环境
FROM node:20-alpine AS production

# 设置容器内的时区（非常重要，否则日志和时间可能不对）
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# 创建非 root 用户来运行应用（安全最佳实践）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 3. 全局安装 PM2
RUN npm install -g pm2@latest

# 新增：为 nestjs 用户创建 PM2 目录并设置权限
RUN mkdir -p /app/.pm2 /home/nestjs/.pm2 && \
    chown -R nestjs:nodejs /app/.pm2 /home/nestjs/.pm2 && \
    chmod -R 777 /app/.pm2 /home/nestjs/.pm2

RUN mkdir -p /app/logs && \
    chown -R nestjs:nodejs /app/logs && \
    chmod -R 777 /app/logs

# 4. 从 builder 阶段复制所需文件，并更改属主
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# 5. 复制 PM2 配置文件
COPY --chown=nestjs:nodejs ecosystem.config.js ./

ENV PM2_HOME=/app/.pm2

# 6. 切换到非 root 用户
USER nestjs

# 暴露应用端口（NestJS 默认 3000）
EXPOSE 3000

# 7. 使用 PM2 作为容器主进程启动应用
# --no-daemon 参数让 PM2 在前台运行，这是 Docker 容器所必需的
CMD ["pm2-runtime", "start", "ecosystem.config.js"]