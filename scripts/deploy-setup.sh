#!/bin/bash
# ============================================================================
# Deployment Setup Script - Command Connect
# ============================================================================
# Helper script untuk setup deployment credentials dan testing
#
# Usage:
#   ./scripts/deploy-setup.sh              # Interactive setup wizard
#   ./scripts/deploy-setup.sh --test      # Test deployment configs

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Deployment Setup - Command Connect                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if test flag
if [[ "$1" == "--test" ]]; then
  echo -e "${YELLOW}🧪 Testing deployment configurations...${NC}\n"
  
  # Test Cloudflare
  echo -e "${BLUE}Cloudflare Pages:${NC}"
  if command -v wrangler &> /dev/null; then
    echo -e "${GREEN}✅ Wrangler CLI installed${NC}"
    if [ -f "wrangler.toml" ]; then
      echo -e "${GREEN}✅ wrangler.toml found${NC}"
    else
      echo -e "${RED}❌ wrangler.toml not found${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  Wrangler CLI not installed${NC}"
    echo "   Install: npm install -g @cloudflare/wrangler"
  fi
  
  # Test GitHub Pages
  echo -e "\n${BLUE}GitHub Pages:${NC}"
  if [ -d ".github/workflows" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflows directory exists${NC}"
    if [ -f ".github/workflows/deploy-admin-panel.yml" ]; then
      echo -e "${GREEN}✅ deploy-admin-panel.yml workflow found${NC}"
    fi
    if [ -f ".github/workflows/deploy-public-site.yml" ]; then
      echo -e "${GREEN}✅ deploy-public-site.yml workflow found${NC}"
    fi
  else
    echo -e "${RED}❌ GitHub Actions workflows directory not found${NC}"
  fi
  
  # Test build output dirs
  echo -e "\n${BLUE}Build Output:${NC}"
  if [ -f "apps/public-site/vite.config.ts" ]; then
    echo -e "${GREEN}✅ Public site vite.config.ts found${NC}"
  fi
  if [ -f "apps/admin/vite.config.ts" ]; then
    echo -e "${GREEN}✅ Admin panel vite.config.ts found${NC}"
  fi
  
  echo -e "\n${GREEN}✅ Configuration test complete!${NC}"
  exit 0
fi

# Interactive setup wizard
echo -e "${YELLOW}This wizard will help you setup deployment for:${NC}"
echo "  1. Public Site → Cloudflare Pages"
echo "  2. Admin Panel → GitHub Pages"
echo ""

# Step 1: Cloudflare Setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Cloudflare Pages Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

read -p "Do you want to setup Cloudflare Pages? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}📝 Getting Cloudflare Credentials${NC}"
  echo "   1. Go to: https://dash.cloudflare.com/profile/api-tokens"
  echo "   2. Click 'Create Token'"
  echo "   3. Use template 'Edit Cloudflare Workers' or 'Cloudflare Pages - Deploy'"
  echo ""
  
  read -p "   Enter CLOUDFLARE_API_TOKEN: " cf_token
  read -p "   Enter CLOUDFLARE_ACCOUNT_ID: " cf_account
  
  echo -e "\n${YELLOW}📝 Add these to GitHub Secrets:${NC}"
  echo "   Repository → Settings → Secrets and variables → Actions"
  echo ""
  echo -e "${GREEN}CLOUDFLARE_API_TOKEN${NC}"
  echo "   $cf_token"
  echo ""
  echo -e "${GREEN}CLOUDFLARE_ACCOUNT_ID${NC}"
  echo "   $cf_account"
  echo ""
  
  echo -e "${YELLOW}✅ To complete setup:${NC}"
  echo "   1. Copy the values above"
  echo "   2. Add as GitHub Secrets"
  echo "   3. In Cloudflare dashboard:"
  echo "      - Create new Pages project"
  echo "      - Connect GitHub repository"
  echo "      - Set build command: bun install && cd apps/public-site && bun run build"
  echo "      - Set output directory: apps/public-site/dist"
  echo "      - Add environment variables as shown in DEPLOYMENT.md"
  echo "      - Connect custom domain: command-connect.id"
  echo ""
fi

# Step 2: GitHub Pages Setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: GitHub Pages Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

read -p "Do you want to setup GitHub Pages? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}✅ Setup Instructions:${NC}"
  echo ""
  echo "   1. Go to Repository Settings → Pages"
  echo "   2. Under 'Build and deployment'"
  echo "      - Source: 'Deploy from a branch'"
  echo "      - Branch: 'main'"
  echo "      - Folder: '/'"
  echo ""
  echo "   3. (Optional) Add custom domain:"
  echo "      - In 'Custom domain': admin.command-connect.id"
  echo "      - Setup DNS CNAME record pointing to GitHub Pages"
  echo ""
  echo -e "${YELLOW}📝 Workflow Configuration:${NC}"
  echo "   The deploy-admin-panel.yml workflow will automatically:"
  echo "   - Build on push to main"
  echo "   - Upload build artifacts"
  echo "   - Deploy to GitHub Pages"
  echo ""
fi

# Step 3: Environment Variables
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Environment Variables${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}📝 Create .env file for development:${NC}"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✅ .env created from .env.example${NC}"
  echo ""
  echo -e "${YELLOW}📝 Configure your .env:${NC}"
  echo "   VITE_PB_URL=http://127.0.0.1:8090"
  echo "   VITE_APP_URL=http://localhost:4173"
  echo "   VITE_ADMIN_APP_URL=http://localhost:4174"
  echo ""
else
  echo -e "${YELLOW}ℹ️  .env already exists${NC}"
fi

# Step 4: Test Build
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Test Build${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

read -p "Do you want to test build now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}🔨 Building Public Site...${NC}"
  cd apps/public-site && bun run build && cd - > /dev/null
  echo -e "${GREEN}✅ Public site built successfully!${NC}"
  
  echo -e "${YELLOW}🔨 Building Admin Panel...${NC}"
  cd apps/admin && bun run build && cd - > /dev/null
  echo -e "${GREEN}✅ Admin panel built successfully!${NC}"
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   - Full guide: DEPLOYMENT.md"
echo "   - Quick start: DEPLOYMENT-QUICKSTART.md"
echo ""

echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "   1. Add GitHub Secrets (if not done)"
echo "   2. Complete Cloudflare Pages setup"
echo "   3. Complete GitHub Pages setup"
echo "   4. Push to main branch to trigger deployment"
echo ""

echo -e "${YELLOW}🔗 Resources:${NC}"
echo "   - Cloudflare Pages: https://dash.cloudflare.com/pages"
echo "   - GitHub Pages: https://github.com/settings/pages"
echo "   - GitHub Secrets: https://github.com/settings/secrets/actions"
echo ""
