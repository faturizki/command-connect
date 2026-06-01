# 🔄 GitHub Actions Workflows

Dokumentasi lengkap untuk GitHub Actions workflows yang digunakan oleh Command Connect.

---

## 📋 Available Workflows

| Workflow | Trigger | Target | Action |
|----------|---------|--------|--------|
| `deploy-public-site.yml` | Push/PR ke `main` | Cloudflare Pages | Build SSR, Deploy |
| `deploy-admin-panel.yml` | Push/PR ke `main` (admin/) | GitHub Pages | Build SPA, Deploy |

---

## 🚀 Deploy Public Site (`deploy-public-site.yml`)

### Trigger Events

```yaml
push:
  branches: [main]
pull_request:
  branches: [main]
```

### Workflow Steps

1. **Checkout code** - Ambil repository
2. **Setup Bun** - Install Bun package manager (v1.1.0)
3. **Install deps** - `bun install --frozen-lockfile`
4. **Lint** - ESLint check
5. **Type check** - TypeScript validation (optional)
6. **Build** - Vite/TanStack Start build
7. **Deploy** - Cloudflare Pages deployment (push only)
8. **Comment PR** - Add preview link (PR only)

### Environment Variables

```yaml
# Set in Cloudflare dashboard or secrets
VITE_PB_URL=https://api.command-connect.id
VITE_APP_URL=https://command-connect.id
```

### GitHub Secrets Required

```
CLOUDFLARE_API_TOKEN    # Cloudflare API token
CLOUDFLARE_ACCOUNT_ID   # Cloudflare account ID
```

### Deployment Target

```
Cloudflare Pages Project: command-connect-public
Production URL: https://command-connect.id
```

---

## 🚀 Deploy Admin Panel (`deploy-admin-panel.yml`)

### Trigger Events

```yaml
push:
  branches: [main]
  paths:
    - apps/admin/**
    - .github/workflows/deploy-admin-panel.yml
pull_request:
  branches: [main]
  paths:
    - apps/admin/**
```

### Workflow Steps

1. **Checkout code** - Ambil repository
2. **Setup Bun** - Install Bun package manager (v1.1.0)
3. **Install deps** - `bun install --frozen-lockfile`
4. **Lint** - ESLint check
5. **Type check** - TypeScript validation (optional)
6. **Build** - Vite build untuk SPA
7. **Setup Pages** - Konfigurasi GitHub Pages
8. **Upload artifact** - Upload `dist/` ke Pages artifact
9. **Deploy** - Deploy ke GitHub Pages (push only)
10. **Comment PR** - Add deployment info (PR only)

### Environment Variables

```yaml
VITE_PB_URL=https://api.command-connect.id
VITE_ADMIN_APP_URL=https://admin.command-connect.id
```

### GitHub Secrets Required

```
(Optional: VITE_PB_URL untuk override)
```

### Permissions Required

```yaml
contents: read
pages: write
id-token: write
```

### Deployment Target

```
GitHub Pages: <account>.github.io/command-connect
Custom Domain: https://admin.command-connect.id
```

---

## 📊 Workflow Status

### View Workflow Runs

```bash
# List workflow runs
gh run list --repo faturizki/command-connect

# View specific workflow
gh run view <run-id> --repo faturizki/command-connect

# Watch workflow run
gh run watch <run-id> --repo faturizki/command-connect
```

### View Logs

1. GitHub → Repository → Actions tab
2. Click workflow run
3. Click job → View logs

### Troubleshoot Failures

```bash
# Get failure details
gh run view <run-id> --repo faturizki/command-connect --log

# Rerun workflow
gh run rerun <run-id> --repo faturizki/command-connect
```

---

## 🔐 Secrets Management

### Setup GitHub Secrets

Repository → Settings → Secrets and variables → Actions

#### Cloudflare Secrets

```
Name: CLOUDFLARE_API_TOKEN
Value: <token dari https://dash.cloudflare.com/profile/api-tokens>

Name: CLOUDFLARE_ACCOUNT_ID
Value: <32 hex chars dari Cloudflare dashboard>
```

#### Optional Overrides

```
Name: VITE_PB_URL
Value: https://api.command-connect.id
(Override untuk production API URL)
```

### Best Practices

- ✅ Use unique tokens per service
- ✅ Set minimal required permissions
- ✅ Rotate tokens regularly
- ✅ Never commit secrets to git
- ✅ Use environment-specific secrets

---

## 🎯 Deployment Strategy

### Branching Model

```
main (production)
  ├─ Protected branch (require reviews)
  ├─ Auto-deploy on push
  └─ Workflows trigger on PR
```

### PR Workflow

```
1. Create feature branch
2. Push & create PR
3. Workflows run (lint, build, preview)
4. Preview links posted in PR
5. Merge after review
6. Production deployment triggered
```

### Production Deployment

```
1. PR merged to main
2. Workflows trigger
3. Code built & tested
4. Deployed to production
   - Cloudflare Pages (public site)
   - GitHub Pages (admin panel)
5. Deployment complete
```

---

## 📈 Performance Optimization

### Build Times

| App | Build Time | Optimizations |
|-----|-----------|---------------|
| Public Site (SSR) | ~2-3min | Tree-shaking, minify |
| Admin Panel (SPA) | ~1-2min | Terser, source maps |

### Caching Strategies

- **Dependencies** - Cached via `frozen-lockfile`
- **Build artifacts** - Not cached (fresh each time)
- **Node modules** - Not cached (uses Bun)

### Network Optimization

- Cloudflare Pages global CDN
- GitHub Pages CDN
- Automatic compression

---

## 🔄 Continuous Integration Checks

### Before Deployment

- ✅ ESLint linting
- ✅ TypeScript type checking
- ✅ Build successful
- ✅ No broken imports

### After Deployment

- ✅ Site accessible at domain
- ✅ API endpoints respond
- ✅ No console errors
- ✅ Performance acceptable

---

## 🚨 Common Issues

### Build Fails

```
Issue: "Cannot find module"
→ Check package.json dependencies
→ Run bun install locally
→ Check import paths
```

### Deployment Fails

```
Issue: "Authentication failed"
→ Verify GitHub Secrets
→ Check token permissions
→ Regenerate token if needed
```

### Slow Builds

```
Issue: Build takes > 5 minutes
→ Check for large dependencies
→ Optimize asset imports
→ Check for blocking I/O
```

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Actions](https://developers.cloudflare.com/pages/platform/github-integration/)
- [GitHub Pages Deployment](https://github.com/actions/deploy-pages)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## 🔧 Workflow Customization

### Modify Build Command

Edit `.github/workflows/deploy-*.yml`:

```yaml
- name: Build
  run: cd apps/public-site && bun run build
  env:
    # Add custom env vars here
    BUILD_TARGET: production
```

### Add Additional Steps

```yaml
- name: Custom Step
  run: |
    echo "Custom command"
    # Your commands here
```

### Set Conditional Execution

```yaml
- name: Deploy
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: |
    # Only run on push to main
```

---

**Last Updated:** 2024-12-16  
**Maintainer:** Command Connect Team
