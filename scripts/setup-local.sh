#!/usr/bin/env bash
# ============================================================
# AIYOU 本地环境一键初始化脚本
# 用法: bash scripts/setup-local.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "================================================"
echo "   AIYOU 本地环境初始化"
echo "================================================"
echo ""

# ---------- 1. 检查前置依赖 ----------

command -v docker >/dev/null 2>&1 || error "未检测到 Docker，请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop"

if ! docker info >/dev/null 2>&1; then
  error "Docker 未运行，请先启动 Docker Desktop"
fi
info "Docker 已就绪"

command -v node >/dev/null 2>&1 || error "未检测到 Node.js，请安装 18+ 版本: https://nodejs.org"
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  error "Node.js 版本过低 ($(node -v))，需要 18+，请升级"
fi
info "Node.js $(node -v) 已就绪"

command -v npx >/dev/null 2>&1 || error "未检测到 npx，请检查 Node.js 安装"
info "npx 已就绪"

# ---------- 2. 安装前端依赖 ----------

echo ""
info "安装前端依赖..."
npm install

# ---------- 3. 启动本地 Supabase ----------

echo ""
info "启动本地 Supabase（首次可能需要几分钟下载镜像）..."
npx supabase start

# 提取 API URL 和 anon key
API_URL=$(npx supabase status --output json 2>/dev/null | grep -o '"API_URL":"[^"]*"' | cut -d'"' -f4)
ANON_KEY=$(npx supabase status --output json 2>/dev/null | grep -o '"ANON_KEY":"[^"]*"' | cut -d'"' -f4)
SERVICE_ROLE_KEY=$(npx supabase status --output json 2>/dev/null | grep -o '"SERVICE_ROLE_KEY":"[^"]*"' | cut -d'"' -f4)

if [ -z "$API_URL" ]; then
  # fallback: 用文本解析
  API_URL=$(npx supabase status 2>/dev/null | grep "API URL" | awk '{print $NF}')
  ANON_KEY=$(npx supabase status 2>/dev/null | grep "anon key" | awk '{print $NF}')
  SERVICE_ROLE_KEY=$(npx supabase status 2>/dev/null | grep "service_role key" | awk '{print $NF}')
fi

if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ]; then
  warn "无法自动提取 Supabase 信息，请手动运行 npx supabase status 查看"
  API_URL="http://localhost:54321"
  ANON_KEY="<请手动填入>"
fi

info "Supabase API URL: $API_URL"
info "Supabase Anon Key: ${ANON_KEY:0:20}..."

# ---------- 4. 执行数据库迁移 ----------

echo ""
info "执行数据库迁移..."
npx supabase db reset

# ---------- 5. 生成 .env.local ----------

echo ""
ENV_FILE=".env.local"

cat > "$ENV_FILE" << EOF
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
VITE_SUPABASE_PROJECT_ID=local
EOF

info "已生成 $ENV_FILE"

# ---------- 6. 提示后续操作 ----------

echo ""
echo "================================================"
echo "   初始化完成！"
echo "================================================"
echo ""
echo "接下来请手动完成以下步骤："
echo ""
echo "  1. 创建管理员账号："
echo "     a) 启动前端: npm run dev"
echo "     b) 打开 http://localhost:8080 注册一个账号"
echo "     c) 打开 Supabase Studio: http://localhost:54323"
echo "     d) 在 SQL Editor 中执行："
echo ""
echo "        INSERT INTO public.admin_users (user_id, username, email, role)"
echo "        SELECT user_id, username, email, '超级管理员'"
echo "        FROM public.profiles LIMIT 1;"
echo ""
echo "  2. 安装并启动 OpenClaw（如需 AI 对话功能）："
echo "     a) 按 OpenClaw 官方文档安装到本地"
echo "     b) 启动后记下地址（如 http://localhost:18789）"
echo "     c) 登录后台 http://localhost:8080/admin"
echo "     d) 进入 LLM 配置页，添加模型："
echo "        - 类型: openclaw"
echo "        - Base URL: http://localhost:18789"
echo "        - API Key: 你的 OpenClaw Token"
echo ""
echo "  3. 创建 Storage Bucket（如需知识库上传功能）："
echo "     a) 打开 http://localhost:54323/storage"
echo "     b) 创建名为 'knowledge' 的 bucket，设为 Public"
echo "     （如果 db reset 已自动创建则跳过）"
echo ""
echo "  4. 启动前端："
echo "     npm run dev"
echo "     然后访问 http://localhost:8080"
echo ""
echo "================================================"
echo "   后续从 Lovable 同步更新："
echo "   git pull && npm install && npx supabase db reset && npm run build"
echo "================================================"
