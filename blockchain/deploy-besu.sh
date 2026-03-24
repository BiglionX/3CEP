#!/bin/bash

# Besu 私有链部署脚本
# FixCycle 6.0 Blockchain Production Deployment

set -e

echo "========================================"
echo "Besu 私有链生产环境部署"
echo "========================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Docker 环境检查通过${NC}"
}

# 创建数据目录
create_directories() {
    echo "📁 创建数据目录..."
    mkdir -p besu-data/validator-1
    mkdir -p besu-data/validator-2
    mkdir -p besu-data/validator-3
    echo -e "${GREEN}✅ 目录创建完成${NC}"
}

# 生成节点密钥
generate_keys() {
    echo "🔑 生成节点私钥..."

    for i in 1 2 3; do
        KEY_DIR="besu-data/validator-$i"
        if [ ! -f "$KEY_DIR/key" ]; then
            docker run --rm \
                -v $PWD/$KEY_DIR:/data \
                hyperledger/besu \
                operator generate-blockchain-config \
                --config-file=/config/config.toml \
                --to=/data \
                --private-key-file-name=key
            echo -e "${GREEN}✅ 节点$i 私钥生成完成${NC}"
        else
            echo -e "${YELLOW}⚠️  节点$i 私钥已存在，跳过${NC}"
        fi
    done
}

# 启动 Besu 节点
start_besu() {
    echo "🚀 启动 Besu 节点..."

    docker-compose -f docker-compose.besu.yml up -d

    echo "等待节点启动..."
    sleep 10

    # 检查节点状态
    for i in 1 2 3; do
        PORT=$((8545 + (i - 1) * 2))
        echo "检查节点$i (端口 $PORT)..."

        MAX_RETRIES=30
        RETRY_COUNT=0

        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
            RESPONSE=$(curl -s -X POST \
                -H "Content-Type: application/json" \
                --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
                http://localhost:$PORT)

            if echo "$RESPONSE" | grep -q "result"; then
                echo -e "${GREEN}✅ 节点$i 启动成功${NC}"
                break
            fi

            RETRY_COUNT=$((RETRY_COUNT + 1))
            sleep 2
        done

        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo -e "${RED}❌ 节点$i 启动失败${NC}"
            exit 1
        fi
    done

    echo -e "${GREEN}✅ 所有 Besu 节点启动成功${NC}"
}

# 显示节点信息
show_info() {
    echo ""
    echo "========================================"
    echo "Besu 私有链部署完成！"
    echo "========================================"
    echo ""
    echo "📊 节点信息:"
    echo "  节点 1: http://localhost:8545 (主节点)"
    echo "  节点 2: http://localhost:8547"
    echo "  节点 3: http://localhost:8549"
    echo ""
    echo "🔗 Chain ID: 2024"
    echo "⛏️  共识机制：IBFT2 PoA"
    echo "⏱️  出块时间：5 秒"
    echo ""
    echo "📝 下一步操作:"
    echo "  1. 编译智能合约：cd blockchain && npm run compile"
    echo "  2. 部署智能合约：npm run deploy:besu"
    echo "  3. 更新合约地址到配置文件"
    echo ""
    echo "🛑 停止命令:"
    echo "  docker-compose -f docker-compose.besu.yml down"
    echo ""
    echo "📋 查看日志:"
    echo "  docker-compose -f docker-compose.besu.yml logs -f"
    echo ""
}

# 主函数
main() {
    check_docker
    create_directories
    generate_keys
    start_besu
    show_info
}

# 执行主函数
main
