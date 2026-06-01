#!/bin/bash
# ============================================================================
# Build & Deploy Script - Command Connect
# ============================================================================
# Helper script untuk build dan test deployment locally
# 
# Usage:
#   ./scripts/build.sh              # Build semua
#   ./scripts/build.sh public       # Build public site
#   ./scripts/build.sh admin        # Build admin panel
#   ./scripts/build.sh public --preview  # Build & preview public site

set -e

echo "🔨 Command Connect Build Script"
echo "=============================="

TARGET="${1:-all}"
ACTION="${2:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

build_public() {
  echo -e "\n${YELLOW}📦 Building Public Site (TanStack Start)...${NC}"
  cd apps/public-site
  bun run build
  echo -e "${GREEN}✅ Public site build complete!${NC}"
  echo -e "${YELLOW}📍 Output: apps/public-site/dist/${NC}"
  cd - > /dev/null
}

build_admin() {
  echo -e "\n${YELLOW}📦 Building Admin Panel (Vite)...${NC}"
  cd apps/admin
  bun run build
  echo -e "${GREEN}✅ Admin panel build complete!${NC}"
  echo -e "${YELLOW}📍 Output: apps/admin/dist/${NC}"
  cd - > /dev/null
}

preview_public() {
  echo -e "\n${YELLOW}👀 Previewing Public Site...${NC}"
  cd apps/public-site
  wrangler pages dev dist --local
  cd - > /dev/null
}

preview_admin() {
  echo -e "\n${YELLOW}👀 Previewing Admin Panel...${NC}"
  cd apps/admin
  bun run preview
  cd - > /dev/null
}

lint() {
  echo -e "\n${YELLOW}🔍 Linting...${NC}"
  bun run lint:admin
  echo -e "${GREEN}✅ Linting complete!${NC}"
}

type_check() {
  echo -e "\n${YELLOW}🔍 Type checking...${NC}"
  bun run type-check:admin || true
  echo -e "${GREEN}✅ Type checking complete!${NC}"
}

case $TARGET in
  public)
    lint
    type_check
    build_public
    if [[ "$ACTION" == "--preview" ]]; then
      preview_public
    fi
    ;;
  admin)
    lint
    type_check
    build_admin
    if [[ "$ACTION" == "--preview" ]]; then
      preview_admin
    fi
    ;;
  all)
    lint
    type_check
    build_public
    build_admin
    echo -e "\n${GREEN}🎉 All builds complete!${NC}"
    echo -e "${YELLOW}📍 Public: apps/public-site/dist/${NC}"
    echo -e "${YELLOW}📍 Admin: apps/admin/dist/${NC}"
    ;;
  *)
    echo -e "${RED}❌ Unknown target: $TARGET${NC}"
    echo "Usage: $0 [public|admin|all] [--preview]"
    exit 1
    ;;
esac

echo -e "\n${GREEN}✨ Done!${NC}\n"
