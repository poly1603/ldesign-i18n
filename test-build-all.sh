#!/bin/bash

# 测试所有 i18n 包的构建
# 使用方法: bash test-build-all.sh

set -e

echo "================================"
echo "开始测试所有包的构建..."
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 包列表
packages=("core" "vue" "react" "angular" "svelte" "solid")

# 构建统计
success_count=0
fail_count=0
failed_packages=()

for pkg in "${packages[@]}"; do
  echo -e "${BLUE}[构建] @ldesign/i18n-${pkg}${NC}"
  echo "路径: packages/${pkg}"
  
  cd "packages/${pkg}"
  
  if pnpm build; then
    echo -e "${GREEN}✅ @ldesign/i18n-${pkg} 构建成功${NC}"
    ((success_count++))
  else
    echo -e "${RED}❌ @ldesign/i18n-${pkg} 构建失败${NC}"
    ((fail_count++))
    failed_packages+=("${pkg}")
  fi
  
  cd ../..
  echo ""
done

echo "================================"
echo "构建测试完成"
echo "================================"
echo -e "${GREEN}成功: ${success_count}${NC}"
echo -e "${RED}失败: ${fail_count}${NC}"

if [ ${fail_count} -gt 0 ]; then
  echo ""
  echo -e "${RED}失败的包:${NC}"
  for pkg in "${failed_packages[@]}"; do
    echo "  - ${pkg}"
  done
  exit 1
else
  echo ""
  echo -e "${GREEN}🎉 所有包构建成功！${NC}"
  exit 0
fi

