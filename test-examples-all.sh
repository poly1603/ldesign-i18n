#!/bin/bash

# 测试所有 i18n examples 的启动
# 使用方法: bash test-examples-all.sh

set -e

echo "================================"
echo "测试所有 examples 依赖安装..."
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 包列表
packages=("core" "vue" "react" "angular" "svelte" "solid")

# 测试统计
success_count=0
fail_count=0
failed_examples=()

for pkg in "${packages[@]}"; do
  echo -e "${BLUE}[测试] @ldesign/i18n-${pkg}-example${NC}"
  echo "路径: packages/${pkg}/examples"
  
  cd "packages/${pkg}/examples"
  
  # 安装依赖
  echo -e "${YELLOW}正在安装依赖...${NC}"
  if pnpm install; then
    echo -e "${GREEN}✅ 依赖安装成功${NC}"
    
    # 测试构建
    echo -e "${YELLOW}正在测试构建...${NC}"
    if pnpm build; then
      echo -e "${GREEN}✅ @ldesign/i18n-${pkg}-example 构建成功${NC}"
      ((success_count++))
    else
      echo -e "${RED}❌ @ldesign/i18n-${pkg}-example 构建失败${NC}"
      ((fail_count++))
      failed_examples+=("${pkg}")
    fi
  else
    echo -e "${RED}❌ @ldesign/i18n-${pkg}-example 依赖安装失败${NC}"
    ((fail_count++))
    failed_examples+=("${pkg}")
  fi
  
  cd ../../..
  echo ""
done

echo "================================"
echo "Examples 测试完成"
echo "================================"
echo -e "${GREEN}成功: ${success_count}${NC}"
echo -e "${RED}失败: ${fail_count}${NC}"

if [ ${fail_count} -gt 0 ]; then
  echo ""
  echo -e "${RED}失败的 examples:${NC}"
  for pkg in "${failed_examples[@]}"; do
    echo "  - ${pkg}"
  done
  exit 1
else
  echo ""
  echo -e "${GREEN}🎉 所有 examples 测试成功！${NC}"
  echo ""
  echo "可以使用以下命令启动示例："
  echo "  pnpm --filter @ldesign/i18n-core-example dev     # 端口 5000"
  echo "  pnpm --filter @ldesign/i18n-vue-example dev      # 端口 5001"
  echo "  pnpm --filter @ldesign/i18n-react-example dev    # 端口 5002"
  echo "  pnpm --filter @ldesign/i18n-angular-example dev  # 端口 5005"
  echo "  pnpm --filter @ldesign/i18n-svelte-example dev   # 端口 5003"
  echo "  pnpm --filter @ldesign/i18n-solid-example dev    # 端口 5004"
  exit 0
fi

