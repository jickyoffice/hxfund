#!/bin/bash
# 黄氏家族寻根平台 - ECS 一键部署脚本
# 适用于阿里云 ECS (CentOS 7+)

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     黄氏家族寻根平台 - ECS 一键部署脚本                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 配置变量
APP_NAME="huangshi-api"
APP_DIR="/var/www/huangshi-genealogy"
NODE_VERSION="18"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then
    log_error "请使用 root 用户运行此脚本"
    exit 1
fi

# 1. 安装 Node.js
log_info "步骤 1/6: 安装 Node.js v${NODE_VERSION}..."
if command -v node &> /dev/null; then
    log_warn "Node.js 已安装，跳过"
else
    curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
    yum install -y nodejs
fi

# 2. 安装 PM2
log_info "步骤 2/6: 安装 PM2..."
npm install -g pm2

# 3. 创建应用目录
log_info "步骤 3/6: 创建应用目录..."
mkdir -p $APP_DIR
cd $APP_DIR

# 4. 上传项目文件（从本地复制）
log_info "步骤 4/6: 准备项目文件..."
# 注意：实际部署时需要从 Git 克隆或 SCP 上传
# 这里假设文件已经上传
if [ ! -f "package.json" ]; then
    log_warn "未找到 package.json，请上传项目文件到 $APP_DIR"
    log_info "可以使用以下命令上传："
    echo "scp -r server/ package.json package-lock.json root@your-ecs-ip:$APP_DIR/"
fi

# 5. 安装依赖
log_info "步骤 5/6: 安装依赖..."
npm install --production

# 6. 初始化认证配置
log_info "步骤 6/6: 初始化认证配置..."
if [ ! -f "server/config/auth.json" ]; then
    mkdir -p server/config
    node -e "
const fs = require('fs');
const crypto = require('crypto');
const config = {
  serverApiKey: 'hs_' + crypto.randomBytes(32).toString('hex'),
  jwtSecret: crypto.randomBytes(64).toString('hex'),
  tokenExpiresIn: 86400000,
  rateLimit: {
    windowMs: 60000,
    maxRequests: 30,
    maxChatRequests: 10
  },
  createdAt: new Date().toISOString()
};
fs.writeFileSync('server/config/auth.json', JSON.stringify(config, null, 2));
console.log('✓ 认证配置已生成');
console.log('API Key: ' + config.serverApiKey);
console.log('请妥善保存 API Key！');
"
else
    log_warn "认证配置已存在，跳过"
fi

# 创建环境变量文件
if [ ! -f "server/config/.env" ]; then
    cat > server/config/.env << EOF
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://hxfund.cn,https://www.hxfund.cn
REDIS_URL=redis://localhost:6379
EOF
    log_info "✓ 环境变量已创建"
fi

# 启动服务
log_info "启动服务..."
pm2 start server/index.js --name $APP_NAME
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

# 安装 Nginx
log_info "安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    yum install -y nginx
fi

# 配置 Nginx
cat > /etc/nginx/conf.d/huangshi.conf << 'EOF'
server {
    listen 80;
    server_name api.hxfund.cn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    部署完成                               ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  应用名称：$APP_NAME                                      ║"
echo "║  应用目录：$APP_DIR                                       ║"
echo "║  运行端口：3000                                           ║"
echo "║  Nginx 端口：80                                           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  常用命令：                                               ║"
echo "║    pm2 status $APP_NAME       # 查看状态                  ║"
echo "║    pm2 logs $APP_NAME         # 查看日志                  ║"
echo "║    pm2 restart $APP_NAME      # 重启服务                  ║"
echo "║    systemctl status nginx     # 查看 Nginx 状态            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
log_info "部署完成！"
