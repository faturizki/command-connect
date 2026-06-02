# ✅ Deployment Checklist - Command Connect

Checklist komprehensif untuk memastikan deployment berjalan dengan lancar.

---

## 📋 Pre-Deployment

### Repository Setup

- [ ] Main branch adalah production branch
- [ ] Branch protection rules dikonfigurasi
- [ ] GitHub Actions enabled
- [ ] Vercel project setup completed
- [ ] Environment variables configured in Vercel
- [ ] (Optional) `VITE_PB_URL` untuk production

### Code Quality

- [ ] `bun install` berhasil
- [ ] `make lint` pass tanpa error
- [ ] `make type-check` pass tanpa error
- [ ] `make build` successful untuk public site
- [ ] `make build-admin` successful untuk admin panel
- [ ] Tidak ada console errors atau warnings

### Configuration Files

- [ ] `vite.config.ts` configured di kedua apps
- [ ] `.env.example` updated
- [ ] `.gitignore` includes dist/, pb_data/, .env
- [ ] `Makefile` updated dengan deployment commands
- [ ] Vercel project settings configured
- [ ] `.vercel/output` prepared by build

### Documentation

- [ ] `README.md` created/updated
- [ ] `DEPLOYMENT.md` created
- [ ] `DEPLOYMENT-QUICKSTART.md` created
- [ ] `.github/WORKFLOWS.md` created
- [ ] `DEPLOYMENT-CHECKLIST.md` created (ini file)
- [ ] `scripts/build.sh` created & executable
- [ ] `scripts/deploy-setup.sh` created & executable

---

## 🌐 Vercel Deployment Setup

### Vercel Project

- [ ] Vercel project created from repository root
- [ ] Build command set to `npm run build`
- [ ] Root directory set to `/`
- [ ] Environment variables configured:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `VITE_APP_URL`
  - [ ] `VITE_TENANT_ROOT_DOMAINS`
- [ ] Domain configured for `infopers.web.id`
- [ ] HTTPS enabled automatically

### Preview & Testing

- [ ] Manual deployment test:
  ```bash
  npm run build
  ```
- [ ] `.vercel/output/` generated
- [ ] Site accessible at `https://infopers.web.id/`
- [ ] No browser console errors
- [ ] API calls work correctly
- [ ] SPA routing functioning properly

---

## 🐙 Admin Panel Setup on Vercel

### Vercel Configuration

- [ ] Admin panel served from `/admin/`
- [ ] `apps/admin` built with base path `/admin/`
- [ ] Static assets published via `.vercel/output`
- [ ] No separate GitHub Pages deployment required

### Preview & Testing

- [ ] Admin panel builds locally: `make build-admin`
- [ ] Preview works: `make preview-admin`
- [ ] Dist folder generated correctly
- [ ] Site accessible at `https://infopers.web.id/admin/`

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
# Public: https://infopers.web.id
# Admin: https://infopers.web.id/admin
```

### Monitoring

- [ ] Vercel deployment triggered
- [ ] Public site deployment completed ✅
- [ ] Admin panel deployment completed ✅
- [ ] Both sites accessible and working

---

## 🔍 Post-Deployment Verification

### Public Site

- [ ] Site loads at `https://infopers.web.id/`
- [ ] SPA routing working
- [ ] All pages accessible
- [ ] Images loading correctly
- [ ] API calls to backend working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

### Admin Panel

- [ ] Site loads at `https://infopers.web.id/admin/`
- [ ] SPA routing working
- [ ] All pages accessible
- [ ] Components rendering correctly
- [ ] API calls to backend working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Auth redirects working

### API Backend

- [ ] Supabase backend reachable
- [ ] API endpoints responding
- [ ] Authentication flow working
- [ ] Data access correct for tenant scope

---

## 📊 Monitoring & Logging

### Vercel

- [ ] Monitor deployment status in Vercel dashboard
- [ ] Review build logs for errors
- [ ] Check runtime logs for SSR and static requests
- [ ] Monitor performance metrics

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
   # Vercel rollback
   # Use the Vercel dashboard to restore a previous deployment
   # or rollback to a known-good commit in GitHub
   git revert <bad-commit>
   git push origin main
   ```

2. **Check Logs:**
   - Vercel dashboard → Deployment logs
   - GitHub → Actions → Failed workflow

3. **Fix & Re-deploy:**
   - Fix issue locally
   - Commit & push
   - CI jobs trigger automatically

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

**Public Site:** ✅ https://infopers.web.id  
**Admin Panel:** ✅ https://infopers.web.id/admin  
**Backend:** ✅ Supabase backend  

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
