#!/bin/bash

# 数据库生产环境部署脚本
# 使用方法: ./scripts/deploy-database.sh

set -e

echo "🚀 开始数据库生产环境部署..."

# 检查必要工具
echo "🔍 检查必要工具..."
if ! command -v supabase &> /dev/null; then
    echo "❌ 未找到 Supabase CLI，请先安装: npm install -g supabase"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ 未找到 psql，请先安装 PostgreSQL 客户端"
    exit 1
fi

# 检查环境变量
echo "🔑 检查环境变量..."
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "❌ 请设置 SUPABASE_PROJECT_ID 环境变量"
    exit 1
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ 请设置 SUPABASE_DB_PASSWORD 环境变量"
    exit 1
fi

# 链接到Supabase项目
echo "🔗 链接Supabase项目..."
supabase link --project-ref="$SUPABASE_PROJECT_ID"

# 执行数据库迁移
echo "📋 执行数据库迁移..."
supabase db push

# 应用RLS策略
echo "🛡️ 应用RLS安全策略..."
psql "$DATABASE_URL" -f supabase/rls_policies.sql

# 验证部署
echo "✅ 验证数据库部署..."
node scripts/verify-database.js

echo "🎉 数据库生产环境部署完成！"