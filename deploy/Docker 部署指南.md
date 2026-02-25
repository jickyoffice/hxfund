# Docker 部署指南

## 📋 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                    阿里云 ECS (Docker)                       │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │    Nginx    │───▶│   API 服务   │───▶│    Redis    │     │
│  │  (反向代理)  │    │  (Docker)   │    │  (缓存)     │     │
│  │  端口 80/443 │    │  端口 3000   │    │  端口 6379   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           阿里云容器镜像服务 (ACR)                    │   │
│  │  registry.cn-hangzhou.aliyuncs.com/xxx/huangshi-api │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 方式一：GitHub Actions 自动部署（推荐）

### 前提条件

1. **阿里云容器镜像服务（ACR）**
   - 创建个人实例（免费）
   - 获取登录密码

2. **ECS 已安装 Docker**

### 配置 Secrets

在 GitHub 仓库添加以下 Secrets：

| Secret 名称 | 说明 | 示例值 |
|-----------|------|--------|
| `ACR_USERNAME` | 阿里云镜像服务用户名 | `your-aliyun-account` |
| `ACR_PASSWORD` | 阿里云镜像服务密码 | `镜像仓库密码` |
| `ACR_NAMESPACE` | 命名空间 | `your-namespace` |
| `ECS_HOST` | ECS 公网 IP | `47.100.xx.xx` |
| `ECS_USER` | SSH 用户名 | `root` |
| `ECS_SSH_KEY` | SSH 私钥 | `-----BEGIN RSA PRIVATE KEY-----...` |
| `API_DOMAIN` | API 域名 | `api.hxfund.cn` |

### 自动部署流程

```bash
# 推送代码到 main 分支
git add .
git commit -m "feat: 更新功能"
git push origin main

# GitHub Actions 自动执行：
# 1. 构建 Docker 镜像
# 2. 推送到阿里云镜像服务
# 3. SSH 到 ECS 拉取镜像
# 4. 重启容器
# 5. 健康检查
```

---

## 🚀 方式二：手动部署

### 1. ECS 安装 Docker

```bash
# 安装 Docker
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

### 2. 本地构建并推送镜像

```bash
# 登录阿里云镜像服务
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 构建镜像
docker build -t registry.cn-hangzhou.aliyuncs.com/your-namespace/huangshi-api:latest .

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/huangshi-api:latest
```

### 3. ECS 拉取并运行

```bash
# 登录镜像服务
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/huangshi-api:latest

# 运行容器
docker run -d \
  --name huangshi-api \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e ALLOWED_ORIGINS=https://hxfund.cn,https://www.hxfund.cn \
  -v /var/www/huangshi-genealogy/logs:/app/logs \
  -v /var/www/huangshi-genealogy/server/config:/app/server/config:ro \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/huangshi-api:latest
```

---

## 🚀 方式三：Docker Compose 部署

### 1. 上传文件到 ECS

```bash
# 在 ECS 上创建目录
mkdir -p /var/www/huangshi-genealogy
cd /var/www/huangshi-genealogy

# 上传文件（从本地）
scp docker-compose.yml deploy/nginx.conf root@your-ecs-ip:/var/www/huangshi-genealogy/
```

### 2. 配置环境变量

```bash
# 创建 .env 文件
cat > .env << EOF
NODE_ENV=production
ALLOWED_ORIGINS=https://hxfund.cn,https://www.hxfund.cn
REDIS_URL=redis://redis:6379
EOF
```

### 3. 启动服务

```bash
# 使用 Docker Compose 启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f api
```

---

## 📦 Dockerfile 说明

### 多阶段构建

```dockerfile
# 阶段 1: 构建依赖（安装完整依赖）
FROM node:18-alpine AS builder
RUN npm ci --only=production

# 阶段 2: 生产环境（仅复制必要文件）
FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
```

**优点**：
- 最终镜像体积小（~150MB）
- 不包含开发依赖
- 构建缓存优化

### 安全特性

- ✅ 使用非 root 用户运行
- ✅ 使用 dumb-init 处理信号
- ✅ 健康检查配置
- ✅ 只读配置挂载

---

## 🔧 常用 Docker 命令

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 停止容器
docker stop huangshi-api

# 启动容器
docker start huangshi-api

# 重启容器
docker restart huangshi-api

# 删除容器
docker rm huangshi-api
```

### 日志查看

```bash
# 查看最近日志
docker logs huangshi-api --tail 100

# 实时查看日志
docker logs -f huangshi-api

# 查看日志（带时间戳）
docker logs -f --timestamps huangshi-api
```

### 镜像管理

```bash
# 查看本地镜像
docker images

# 删除旧镜像
docker rmi registry.cn-hangzhou.aliyuncs.com/xxx/huangshi-api:old

# 清理未使用的镜像
docker image prune -f
```

### 进入容器

```bash
# 进入容器 shell
docker exec -it huangshi-api sh

# 查看容器资源使用
docker stats huangshi-api
```

---

## 📊 镜像大小优化

### 优化前 vs 优化后

| 阶段 | 大小 |
|------|------|
| 基础镜像 (node:18) | ~900MB |
| 优化后 (node:18-alpine) | ~150MB |

### 优化技巧

1. **使用 Alpine 基础镜像**
   ```dockerfile
   FROM node:18-alpine
   ```

2. **多阶段构建**
   ```dockerfile
   FROM node:18-alpine AS builder
   # ... 构建 ...
   FROM node:18-alpine
   COPY --from=builder ...
   ```

3. **清理缓存**
   ```dockerfile
   RUN npm cache clean --force
   ```

4. **.dockerignore**
   ```
   node_modules
   .git
   *.md
   ```

---

## ⚠️ 常见问题

### Q1: 容器启动失败

**错误**: `Error: Cannot find module`

**解决**:
```bash
# 检查挂载卷
docker inspect huangshi-api | grep Mounts -A 20

# 重新构建镜像
docker build --no-cache -t ... .
```

### Q2: 健康检查失败

**错误**: `Health check failed`

**解决**:
```bash
# 手动检查健康端点
curl http://localhost:3000/api/health

# 查看容器日志
docker logs huangshi-api
```

### Q3: 镜像推送失败

**错误**: `denied: requested access to the resource is denied`

**解决**:
```bash
# 重新登录
docker login registry.cn-hangzhou.aliyuncs.com

# 检查命名空间权限
# 阿里云控制台 → 容器镜像服务 → 命名空间
```

---

## 📈 监控与日志

### 容器监控

```bash
# 实时资源使用
docker stats

# 容器详细信息
docker inspect huangshi-api
```

### 日志收集

```bash
# 查看日志驱动
docker inspect huangshi-api | grep LogPath

# 日志文件位置
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```

### 日志轮转（防止磁盘占满）

创建 `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

重启 Docker:
```bash
systemctl restart docker
```

---

**更新日期**: 2026 年 2 月 25 日
