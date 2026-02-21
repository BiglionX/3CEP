# FixCycle 项目 Makefile
# 统一的开发、测试、部署命令入口

# 项目基本信息
PROJECT_NAME := FixCycle
VERSION := 1.0.0

# 默认目标
.PHONY: help
help:
	@echo "$(PROJECT_NAME) 开发工具箱"
	@echo "========================"
	@echo ""
	@echo "🎯 核心命令:"
	@echo "  make setup     - 完整环境设置"
	@echo "  make check     - 综合健康检查"
	@echo "  make test      - 运行所有测试"
	@echo "  make deploy    - 本地开发部署"
	@echo "  make seed      - 数据初始化"
	@echo ""
	@echo "⚡ 快速命令:"
	@echo "  make dev       - 启动开发服务器"
	@echo "  make clean     - 清理环境"
	@echo "  make logs      - 查看服务日志"
	@echo "  make status    - 查看服务状态"
	@echo ""
	@echo "🔧 开发辅助:"
	@echo "  make install   - 安装依赖"
	@echo "  make build     - 构建项目"
	@echo "  make lint      - 代码检查"

# 环境设置
.PHONY: setup
setup: install setup-env check-health
	@echo "✅ 环境设置完成"

.PHONY: setup-env
setup-env:
	@echo "🔧 设置环境变量..."
	npm run setup:env

# 健康检查
.PHONY: check check-health
check-health check:
	@echo "🏥 运行健康检查..."
	npm run check:health

# 依赖安装
.PHONY: install
install:
	@echo "📦 安装项目依赖..."
	npm install

# 开发服务器
.PHONY: dev
dev:
	@echo "🚀 启动开发服务器..."
	npm run dev

# 构建项目
.PHONY: build
build:
	@echo "🏗️  构建项目..."
	npm run build

# 代码检查
.PHONY: lint
lint:
	@echo "🔍 代码质量检查..."
	npm run lint

# 测试相关
.PHONY: test test-all
test-all test:
	@echo "🧪 运行测试套件..."
	npm run test:all

.PHONY: test-unit
test-unit:
	@echo "🔬 运行单元测试..."
	npm test

.PHONY: test-e2e
test-e2e:
	@echo "🎭 运行端到端测试..."
	npm run test:e2e:run

# 部署相关
.PHONY: deploy deploy-dev
deploy-dev deploy:
	@echo "🚀 部署开发环境..."
	npm run deploy:dev

.PHONY: deploy-datacenter
deploy-datacenter:
	@echo "🐳 部署 DataCenter 环境..."
	npm run deploy:dev:datacenter

.PHONY: deploy-n8n
deploy-n8n:
	@echo "🤖 部署 n8n 环境..."
	npm run deploy:dev:n8n

# 数据相关
.PHONY: seed
seed:
	@echo "🌱 初始化数据..."
	npm run seed

.PHONY: seed-minimal
seed-minimal:
	@echo "🌱 初始化最小数据集..."
	npm run seed -- --minimal

.PHONY: seed-full
seed-full:
	@echo "🌱 初始化完整数据集..."
	npm run seed -- --full

# 服务管理
.PHONY: start stop restart
start:
	@echo "🟢 启动服务..."
	npm run data-center:start

stop:
	@echo "🔴 停止服务..."
	npm run data-center:stop

restart:
	@echo "🔄 重启服务..."
	npm run data-center:restart

# 状态和日志
.PHONY: status
status:
	@echo "📊 服务状态..."
	npm run data-center:status

.PHONY: logs
logs:
	@echo "📋 服务日志..."
	npm run data-center:logs

# 清理环境
.PHONY: clean
clean:
	@echo "🧹 清理环境..."
	docker system prune -f
	rm -rf node_modules/.cache
	rm -rf .next

# 数据库相关
.PHONY: db-verify db-backup
db-verify:
	@echo "🔍 验证数据库..."
	npm run verify:database

db-backup:
	@echo "💾 备份数据库..."
	npm run backup:database

# 性能和安全
.PHONY: perf security
perf:
	@echo "⚡ 性能测试..."
	node scripts/performance-test.js

security:
	@echo "🛡️  安全检查..."
	node scripts/security-check.js

# 版本和发布
.PHONY: version
version:
	@echo "🔖 当前版本: $(VERSION)"
	@git describe --tags --always

.PHONY: release
release: test build
	@echo "📦 准备发布..."
	# 这里可以添加发布相关的命令

# 开发工作流
.PHONY: workflow
workflow: check test build
	@echo "🔄 完整开发工作流执行完毕"

# 快速验证
.PHONY: verify quick-verify
quick-verify verify:
	@echo "⚡ 快速验证..."
	npm run setup:env
	npm run check:health
	@echo "✅ 快速验证完成"

# 帮助信息
.PHONY: info
info:
	@echo "$(PROJECT_NAME) 项目信息"
	@echo "=================="
	@echo "版本: $(VERSION)"
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@if command -v docker >/dev/null 2>&1; then \
		echo "Docker: $$(docker --version)"; \
	else \
		echo "Docker: 未安装"; \
	fi