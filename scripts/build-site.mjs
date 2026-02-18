import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEGAL_PAGES,
  SITE_ORIGIN,
  renderMarkdown,
  renderLegalHtml,
  renderRedirectHtml
} from "./legal-pages.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const STATIC_FILES = [
  "CNAME",
  "LICENSE",
  "PrivacyPolicy.html",
  "_config.yml",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "index.html",
  "proof.html",
  "robots.txt",
  "site.webmanifest",
  "sitemap.xml",
  "styles.css",
  "RobotoCondensed-Bold.woff2",
  "RobotoCondensed-Light.woff2",
  "RobotoCondensed-Regular.woff2"
];

const STATIC_DIRS = ["fonts", "images", "medals"];

async function exists(relativePath) {
  try {
    await fs.access(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(relativePath) {
  if (!(await exists(relativePath))) {
    return;
  }

  const from = path.join(ROOT, relativePath);
  const to = path.join(DIST, relativePath);
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.cp(from, to, { recursive: true });
}

async function buildSite() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  for (const file of STATIC_FILES) {
    await copyIfExists(file);
  }

  for (const dir of STATIC_DIRS) {
    await copyIfExists(dir);
  }

  for (const page of LEGAL_PAGES) {
    const markdownPath = path.join(ROOT, page.source);
    const markdown = await fs.readFile(markdownPath, "utf8");
    const contentHtml = renderMarkdown(markdown);
    const pageHtml = renderLegalHtml({ ...page, contentHtml, siteOrigin: SITE_ORIGIN });
    const pageDir = path.join(DIST, page.slug);

    await fs.mkdir(pageDir, { recursive: true });
    await fs.writeFile(path.join(pageDir, "index.html"), pageHtml, "utf8");
    await fs.writeFile(
      path.join(DIST, `${page.slug}.html`),
      renderRedirectHtml(page.slug, SITE_ORIGIN),
      "utf8"
    );
  }

  await fs.writeFile(path.join(DIST, ".nojekyll"), "", "utf8");
}

buildSite().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
