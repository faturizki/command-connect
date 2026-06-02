import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDist = path.join(root, "apps/public-site/dist");
const adminDist = path.join(root, "apps/admin/dist");
const output = path.join(root, ".vercel/output");

async function copyRecursive(src, dest) {
  await mkdir(dest, { recursive: true });
  for (const entry of await readdir(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  const publicStat = await stat(publicDist).catch(() => null);
  if (!publicStat || !publicStat.isDirectory()) {
    throw new Error(`Public site build output not found: ${publicDist}`);
  }

  const adminStat = await stat(adminDist).catch(() => null);
  if (!adminStat || !adminStat.isDirectory()) {
    throw new Error(`Admin build output not found: ${adminDist}`);
  }

  await copyRecursive(publicDist, output);
  await copyRecursive(adminDist, path.join(output, "static", "admin"));

  // Create Vercel config for proper static routing
  const config = {
    version: 3,
    routes: [
      { src: "/admin/(.*)", dest: "/static/admin/index.html" },
      { src: "/assets/(.*)", dest: "/assets/$1" },
      { src: "/(.*)", dest: "/index.html" }
    ],
    cleanUrls: true,
    trailingSlash: false
  };
  
  await writeFile(
    path.join(output, "config.json"),
    JSON.stringify(config, null, 2)
  );

  console.log("✅ Vercel build output prepared in .vercel/output");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
