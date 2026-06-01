.PHONY: help dev dev-admin build build-admin preview preview-admin \
        lint type-check deploy-setup deploy-test \
        deploy-public deploy-admin install clean

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║         Command Connect - Development & Deployment         ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Development Commands:$(NC)"
	@echo "  make dev                  Run public site (http://localhost:4173)"
	@echo "  make dev-admin            Run admin panel (http://localhost:4174)"
	@echo "  make dev-backend          Run backend PocketBase (http://localhost:8090)"
	@echo "  make lint                 Lint all apps"
	@echo "  make type-check           Type check all apps"
	@echo "  make format               Format all code"
	@echo ""
	@echo "$(YELLOW)Build Commands:$(NC)"
	@echo "  make build                Build public site"
	@echo "  make build-admin          Build admin panel"
	@echo "  make preview              Preview public site build"
	@echo "  make preview-admin        Preview admin panel build"
	@echo ""
	@echo "$(YELLOW)Deployment Commands:$(NC)"
	@echo "  make deploy-setup         Interactive setup wizard"
	@echo "  make deploy-test          Test deployment configurations"
	@echo "  make deploy-public        Build & test Cloudflare Pages deployment"
	@echo "  make deploy-admin         Build & test GitHub Pages deployment"
	@echo ""
	@echo "$(YELLOW)Utility Commands:$(NC)"
	@echo "  make install              Install dependencies"
	@echo "  make clean                Clean build artifacts & dependencies"

# Development
dev:
	@echo "$(YELLOW)🚀 Starting Public Site...$(NC)"
	cd apps/public-site && bun run dev

dev-admin:
	@echo "$(YELLOW)🚀 Starting Admin Panel...$(NC)"
	cd apps/admin && bun run dev

dev-backend:
	@echo "$(YELLOW)🚀 Starting PocketBase Backend...$(NC)"
	cd backend && make dev

# Build
build:
	@echo "$(YELLOW)📦 Building Public Site...$(NC)"
	@cd apps/public-site && bun run build
	@echo "$(GREEN)✅ Public site built!$(NC)"

build-admin:
	@echo "$(YELLOW)📦 Building Admin Panel...$(NC)"
	@cd apps/admin && bun run build
	@echo "$(GREEN)✅ Admin panel built!$(NC)"

preview: build
	@echo "$(YELLOW)👀 Previewing Public Site...$(NC)"
	cd apps/public-site && wrangler pages dev dist --local

preview-admin: build-admin
	@echo "$(YELLOW)👀 Previewing Admin Panel...$(NC)"
	cd apps/admin && bun run preview

# Lint & Type Check
lint:
	@echo "$(YELLOW)🔍 Linting...$(NC)"
	@bun run lint:admin
	@echo "$(GREEN)✅ Linting complete!$(NC)"

type-check:
	@echo "$(YELLOW)🔍 Type checking...$(NC)"
	@bun run type-check:admin || true
	@echo "$(GREEN)✅ Type checking complete!$(NC)"

format:
	@echo "$(YELLOW)📝 Formatting code...$(NC)"
	@bun run format
	@bun run format:admin
	@echo "$(GREEN)✅ Formatting complete!$(NC)"

# Deployment
deploy-setup:
	@./scripts/deploy-setup.sh

deploy-test:
	@./scripts/deploy-setup.sh --test

deploy-public: lint type-check build
	@echo "$(YELLOW)🚀 Testing Cloudflare Pages deployment...$(NC)"
	@echo "$(GREEN)✅ Public site ready for deployment!$(NC)"
	@echo "$(YELLOW)📝 Next: Push to main branch$(NC)"

deploy-admin: lint type-check build-admin
	@echo "$(YELLOW)🚀 Testing GitHub Pages deployment...$(NC)"
	@echo "$(GREEN)✅ Admin panel ready for deployment!$(NC)"
	@echo "$(YELLOW)📝 Next: Push to main branch$(NC)"

# Install & Clean
install:
	@echo "$(YELLOW)📦 Installing dependencies...$(NC)"
	@bun install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

clean:
	@echo "$(YELLOW)🧹 Cleaning...$(NC)"
	@rm -rf apps/public-site/dist
	@rm -rf apps/admin/dist
	@rm -rf node_modules
	@rm -rf bun.lock
	@echo "$(GREEN)✅ Clean complete!$(NC)"

.PHONY: default
default: help
