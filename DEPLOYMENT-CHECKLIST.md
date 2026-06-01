# ✅ Deployment Checklist - Command Connect

Checklist komprehensif untuk memastikan deployment berjalan dengan lancar.

---

## 📋 Pre-Deployment

### Repository Setup

- [ ] Main branch adalah production branch
- [ ] Branch protection rules dikonfigurasi
- [ ] GitHub Actions enabled
- [ ] Secrets configured:
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] (Optional) `VITE_PB_URL` untuk production

### Code Quality

- [ ] `bun install` berhasil
- [ ] `make lint` pass tanpa error
- [ ] `make type-check` pass tanpa error
- [ ] `make build` successful untuk public site
- [ ] `make build-admin` successful untuk admin panel
- [ ] Tidak ada console errors atau warnings

### Configuration Files

- [ ] `.github/workflows/deploy-public-site.yml` created
- [ ] `.github/workflows/deploy-admin-panel.yml` created
- [ ] `wrangler.toml` configured untuk Cloudflare
- [ ] `vite.config.ts` configured di kedua apps
- [ ] `.env.example` updated
- [ ] `.gitignore` includes dist/, pb_data/, .env
- [ ] `Makefile` updated dengan deployment commands
- [ ] `_config.yml` created untuk GitHub Pages

### Documentation

- [ ] `README.md` created/updated
- [ ] `DEPLOYMENT.md` created
- [ ] `DEPLOYMENT-QUICKSTART.md` created
- [ ] `.github/WORKFLOWS.md` created
- [ ] `DEPLOYMENT-CHECKLIST.md` created (ini file)
- [ ] `scripts/build.sh` created & executable
- [ ] `scripts/deploy-setup.sh` created & executable

---

## 🌐 Cloudflare Pages Setup

### Cloudflare Dashboard

- [ ] Cloudflare account created & verified
- [ ] Domain registered & verified
- [ ] SSL/TLS certificate active

### API Token

- [ ] Cloudflare API Token generated
- [ ] Token permissions: `Cloudflare Pages - Deploy`
- [ ] Token copied ke GitHub Secrets: `CLOUDFLARE_API_TOKEN`
- [ ] Account ID copied ke GitHub Secrets: `CLOUDFLARE_ACCOUNT_ID`

### Pages Project

- [ ] Pages project created
- [ ] Repository connected via GitHub
- [ ] Build command configured:
  ```
  bun install && cd apps/public-site && bun run build
  ```
- [ ] Output directory set: `apps/public-site/dist`
- [ ] Environment variables set:
  - [ ] `VITE_PB_URL`
  - [ ] `VITE_APP_URL`

### Custom Domain

- [ ] Custom domain `command-connect.id` added
- [ ] DNS records pointing to Cloudflare
- [ ] SSL certificate auto-provisioned
- [ ] Domain accessible via HTTPS

### Preview & Testing

- [ ] Manual deployment test:
  ```bash
  wrangler pages deploy apps/public-site/dist
  ```
- [ ] Site accessible at domain
- [ ] No errors di browser console
- [ ] API calls work correctly
- [ ] SSR functioning properly

---

## 🐙 GitHub Pages Setup

### Repository Configuration

- [ ] GitHub Pages enabled
- [ ] Source set to main branch
- [ ] Build & deployment folder: `/`
- [ ] Environment: `github-pages` configured

### Custom Domain (Optional)

- [ ] Custom domain configured: `admin.command-connect.id`
- [ ] DNS CNAME record created:
  ```
  admin.command-connect.id CNAME <github-username>.github.io
  ```
- [ ] HTTPS enabled & certificate valid
- [ ] Domain accessible

### GitHub Actions

- [ ] `deploy-admin-panel.yml` workflow created
- [ ] Workflow permissions set:
  - [ ] `contents: read`
  - [ ] `pages: write`
  - [ ] `id-token: write`
- [ ] Artifacts upload configured
- [ ] Deployment action configured

### Preview & Testing

- [ ] Admin panel builds locally: `make build-admin`
- [ ] Preview works: `make preview-admin`
- [ ] Dist folder generated correctly
- [ ] Site accessible at domain/URL

---

## 🚀 First Deployment

### Manual Test

```bash
# 1. Test public site
make deploy-public

# 2. Test admin panel
make deploy-admin

# 3. Check outputs
ls apps/public-site/dist/
ls apps/admin/dist/
```

### Automated Deployment

```bash
# 1. Commit all changes
git add .
git commit -m "feat: add deployment configuration"

# 2. Push to main
git push origin main

# 3. Monitor workflows
# Go to: GitHub → Actions tab

# 4. Verify deployments
# Public: https://command-connect.id
# Admin: https://admin.command-connect.id
```

### Monitoring

- [ ] GitHub Actions workflow triggered
- [ ] Public site workflow completed ✅
- [ ] Admin panel workflow completed ✅
- [ ] Cloudflare deployment successful
- [ ] GitHub Pages deployment successful
- [ ] Both sites accessible and working

---

## 🔍 Post-Deployment Verification

### Public Site (Cloudflare Pages)

- [ ] Site loads at https://command-connect.id
- [ ] SSR working (view page source shows HTML)
- [ ] All pages accessible
- [ ] Images loading correctly
- [ ] API calls to backend working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

### Admin Panel (GitHub Pages)

- [ ] Site loads at admin URL
- [ ] SPA routing working
- [ ] All pages accessible
- [ ] Components rendering correctly
- [ ] API calls to backend working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Auth redirects working

### API Backend

- [ ] PocketBase running at https://api.command-connect.id
- [ ] Collections accessible
- [ ] CORS configured correctly
- [ ] Auth endpoints working
- [ ] Data endpoints responding

---

## 📊 Monitoring & Logging

### Cloudflare

- [ ] Monitor deployment logs:
  ```bash
  wrangler pages deployment list --project-name=command-connect-public
  ```
- [ ] Check real-time logs
- [ ] Monitor error rates
- [ ] Check performance metrics

### GitHub Pages

- [ ] Monitor workflow runs in Actions
- [ ] Check deployment history
- [ ] Review error logs if needed
- [ ] Monitor GitHub Pages uptime

### Application

- [ ] Monitor API responses
- [ ] Check error logging
- [ ] Monitor performance
- [ ] Check user activity

---

## 🔐 Security

- [ ] Secrets tidak visible di logs
- [ ] API tokens have minimal permissions
- [ ] HTTPS enabled everywhere
- [ ] CORS configured correctly
- [ ] Rate limiting configured (if needed)
- [ ] Admin panel protected by auth
- [ ] Database backups configured
- [ ] Disaster recovery plan ready

---

## 📝 Documentation

- [ ] README.md up to date
- [ ] DEPLOYMENT.md complete
- [ ] DEPLOYMENT-QUICKSTART.md complete
- [ ] Workflows documented
- [ ] Troubleshooting guide available
- [ ] Team trained on deployment process
- [ ] Runbook created for emergency deployment

---

## 🚨 Rollback Procedure

### If Issues Occur

1. **Immediate Rollback:**
   ```bash
   # Cloudflare Pages
   wrangler pages deployment rollback \
     --project-name=command-connect-public \
     --deployment-id=<previous-deployment-id>
   
   # GitHub Pages (push previous commit)
   git revert <bad-commit>
   git push origin main
   ```

2. **Check Logs:**
   - Cloudflare dashboard → Deployments
   - GitHub → Actions → Failed workflow

3. **Fix & Re-deploy:**
   - Fix issue locally
   - Commit & push
   - Workflows trigger automatically

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] All URLs accessible
- [ ] All endpoints responding
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Backup/rollback tested

---

## 🎉 Deployment Complete!

**Public Site:** ✅ https://command-connect.id  
**Admin Panel:** ✅ https://admin.command-connect.id  
**Backend:** ✅ https://api.command-connect.id  

---

## 📞 Support

Jika ada issues:

1. Check logs di GitHub Actions
2. Review DEPLOYMENT.md troubleshooting
3. Check Cloudflare/GitHub status
4. Contact team lead

---

**Version:** 1.0  
**Last Updated:** 2024-12-16  
**Status:** ✅ Ready for Deployment
