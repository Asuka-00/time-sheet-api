# ============================================
# Stage 1: Builder
# ============================================
FROM node:20-alpine AS builder

# 定义数据库驱动构建参数，默认为 mysql2
ARG DB_DRIVER=mysql2

# 配置国内镜像源（针对中国网络环境优化）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 配置 npm 淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com

# 安装所有依赖（包括 devDependencies）
RUN npm ci --legacy-peer-deps

# 安装指定的数据库驱动（通过构建参数指定）
RUN npm install --legacy-peer-deps ${DB_DRIVER}

# 复制源代码和配置文件
COPY src ./src
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# 使用生产环境构建项目
RUN npm run build:prod

# 清理 devDependencies，只保留生产依赖
RUN npm prune --omit=dev --legacy-peer-deps

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine

# 配置国内镜像源（针对中国网络环境优化）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装运行时依赖
RUN apk add --no-cache tini

# 设置工作目录
WORKDIR /app

# 从 builder 阶段复制必要文件（包括已清理的 node_modules）
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 9000

# 使用 tini 作为初始化进程
ENTRYPOINT ["/sbin/tini", "--"]

# 启动应用
CMD ["node", "dist/main"]

