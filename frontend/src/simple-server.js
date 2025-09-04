import express from "express";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import dotenv from "dotenv";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;
const vitePort = 3001;

const Backend_Root_Url =
  process.env.VITE_BACKEND_ROOT_URL || "http://localhost:5000";

const VITE_FRONTEND_ADMIN_URL = process.env.VITE_FRONTEND_ADMIN_URL || "";

console.log(`🔧 Environment: ${isProduction ? "Production" : "Development"}`);
console.log(`🔧 PORT from env: ${process.env.PORT}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔧 Admin URL: ${VITE_FRONTEND_ADMIN_URL}`);

const app = express();

// Read LazyLoading CSS content
let lazyLoadingCSS = "";
try {
  const cssPath = resolve(__dirname, "LazyLoding.css");
  if (existsSync(cssPath)) {
    lazyLoadingCSS = readFileSync(cssPath, "utf8");
    console.log("✅ LazyLoading CSS loaded successfully");
  } else {
    console.warn("⚠️ LazyLoding.css not found at:", cssPath);
  }
} catch (error) {
  console.error("❌ Failed to load LazyLoding.css:", error.message);
}

// Function to find built assets in production
function findBuiltAssets() {
  if (!isProduction) return { jsFile: null, cssFile: null };

  const distPath = resolve(__dirname, "../dist/client");
  const indexHtmlPath = resolve(distPath, "index.html");

  console.log(`🔍 Looking for assets in: ${distPath}`);

  if (existsSync(indexHtmlPath)) {
    try {
      const indexContent = readFileSync(indexHtmlPath, "utf8");
      console.log("📄 Reading built index.html for asset paths");

      // Extract script src from built index.html (more flexible patterns)
      const scriptMatch = indexContent.match(/src="([^"]*\.js[^"]*)"/);
      const cssMatch = indexContent.match(/href="([^"]*\.css[^"]*)"/);

      if (scriptMatch || cssMatch) {
        console.log("✅ Found assets from index.html");
        if (scriptMatch) console.log("🎯 JS from HTML:", scriptMatch[1]);
        if (cssMatch) console.log("🎯 CSS from HTML:", cssMatch[1]);

        return {
          jsFile: scriptMatch ? scriptMatch[1] : null,
          cssFile: cssMatch ? cssMatch[1] : null,
        };
      }
    } catch (error) {
      console.warn("⚠️ Failed to read index.html:", error.message);
    }
  }

  const possiblePaths = [resolve(distPath, "assets"), distPath];

  for (const searchPath of possiblePaths) {
    if (existsSync(searchPath)) {
      const files = readdirSync(searchPath);
      console.log(`🔍 Found files in ${searchPath}:`, files);

      const jsFile = files.find(
        (file) => file.endsWith(".js") && !file.includes(".map")
      );
      const cssFile = files.find(
        (file) => file.endsWith(".css") && !file.includes(".map")
      );

      if (jsFile) {
        const jsPath =
          searchPath === distPath ? `/${jsFile}` : `/assets/${jsFile}`;
        const cssPath = cssFile
          ? searchPath === distPath
            ? `/${cssFile}`
            : `/assets/${cssFile}`
          : null;

        console.log("🎯 Found JS file:", jsFile, "at path:", jsPath);
        console.log("🎯 Found CSS file:", cssFile, "at path:", cssPath);

        return {
          jsFile: jsPath,
          cssFile: cssPath,
        };
      }
    }
  }

  console.error("❌ No JS files found in any expected locations!");
  return { jsFile: null, cssFile: null };
}

// Get built asset filenames
const builtAssets = findBuiltAssets();

// In development, only serve public assets, let Vite handle everything else
if (!isProduction) {
  const publicPath = resolve(__dirname, "../public");
  if (existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log("📦 Serving public assets from:", publicPath);
  }
} else {
  // In production, serve built assets
  const distPath = resolve(__dirname, "../dist/client");
  console.log("🔍 Looking for production files at:", distPath);

  if (existsSync(distPath)) {
    // Serve static assets but exclude index.html to allow SSR
    app.use(
      express.static(distPath, {
        index: false, // Don't serve index.html automatically
        setHeaders: (res, path) => {
          // Cache assets but not HTML files
          if (
            path.endsWith(".js") ||
            path.endsWith(".css") ||
            path.endsWith(".ico")
          ) {
            res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
          }
        },
      })
    );
    console.log("📦 Serving production files from:", distPath);
  } else {
    console.error("❌ Production build not found at:", distPath);
    console.log(
      "💡 Make sure to run 'npm run build' before starting production server"
    );
  }
}

// Enhanced safe fetch with better error handling
async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SSR-Server/1.0",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);

    // Handle IPv6 fallback for localhost
    if (
      (err.code === "ECONNREFUSED" ||
        err.name === "AbortError" ||
        err.message.includes("fetch failed")) &&
      url.includes("localhost") &&
      !url.includes("127.0.0.1")
    ) {
      const ipv4Url = url.replace("localhost", "127.0.0.1");

      try {
        const fallbackResponse = await fetch(ipv4Url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "SSR-Server/1.0",
            ...options.headers,
          },
        });
        return fallbackResponse;
      } catch (fallbackErr) {
        console.error(`❌ IPv4 fallback failed:`, fallbackErr.message);
        throw fallbackErr;
      }
    }

    console.error(`❌ Fetch failed for ${url}:`, err.message);
    throw err;
  }
}

// Backend health check
async function checkBackendHealth() {
  console.log(`🔍 Checking backend health at: ${Backend_Root_Url}`);
  try {
    const response = await safeFetch(`${Backend_Root_Url}/api/seo/static`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend is healthy`);
      return true;
    } else {
      console.error(`⚠️ Backend responded with status ${response.status}`);
      process.exit(1);
      return false;
    }
  } catch (error) {
    console.error(`❌ Backend health check failed:`, error.message);
    process.exit(1);
    return false;
  }
}

checkBackendHealth();

// Fetch SEO data helper (only for main pages)
async function fetchSEOData(pathname) {
  try {
    let seoEndpoint = "home";

    switch (pathname) {
      case "/":
        seoEndpoint = "home";
        break;
      case "/projects":
        seoEndpoint = "projects";
        break;
      case "/skills":
        seoEndpoint = "skills";
        break;
      case "/cv":
        seoEndpoint = "cv";
        break;
      case "/contact":
        seoEndpoint = "contact";
        break;
      default:
        seoEndpoint = "home";
    }

    const [staticResponse, pageResponse] = await Promise.allSettled([
      safeFetch(`${Backend_Root_Url}/api/seo/static`),
      safeFetch(`${Backend_Root_Url}/api/seo/${seoEndpoint}`),
    ]);

    let staticData = {};
    let pageData = {};

    if (staticResponse.status === "fulfilled" && staticResponse.value.ok) {
      try {
        staticData = await staticResponse.value.json();
      } catch (jsonError) {
        console.error(`❌ Failed to parse static SEO JSON:`, jsonError.message);
      }
    }

    if (pageResponse.status === "fulfilled" && pageResponse.value.ok) {
      try {
        pageData = await pageResponse.value.json();
      } catch (jsonError) {
        console.error(`❌ Failed to parse page SEO JSON:`, jsonError.message);
      }
    }

    return { staticData, pageData };
  } catch (error) {
    console.error("❌ Unexpected error in fetchSEOData:", error.message);
    return {
      staticData: {},
      pageData: {},
    };
  }
}

// Get static logo (fallback for special pages)
async function getStaticLogo() {
  try {
    const response = await safeFetch(`${Backend_Root_Url}/api/seo/static`);
    if (response.ok) {
      const data = await response.json();
      return data.WebLogo || "";
    }
  } catch (error) {
    console.error("❌ Failed to fetch static logo:", error.message);
    process.exit(1);
  }
  return "";
}

// Generate 404 Not Found Page
function generate404Page(webLogo) {
  const scriptSrc = isProduction
    ? builtAssets.jsFile || "/src/main.jsx"
    : `http://localhost:${vitePort}/src/main.jsx`;

  const cssLink =
    isProduction && builtAssets.cssFile
      ? `<link rel="stylesheet" href="${builtAssets.cssFile}" />`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Not Found</title>
    <meta name="description" content="The page you are looking for could not be found." />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${
      webLogo ? `<link rel="icon" type="image/x-icon" href="${webLogo}" />` : ""
    }
    ${webLogo ? `<link rel="apple-touch-icon" href="${webLogo}" />` : ""}
    ${webLogo ? `<link rel="shortcut icon" href="${webLogo}" />` : ""}
    ${cssLink}
    <style>
      ${lazyLoadingCSS}
    </style>
    ${
      !isProduction
        ? `<script type="module">
      import RefreshRuntime from 'http://localhost:${vitePort}/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`
        : ""
    }
  </head>
  <body>
    <div id="root">
      <div class="loading-overlay">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Page Not Found</p>
        </div>
      </div>
    </div>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
}

// Generate Access Denied Page
function generateDeniedPage(webLogo) {
  const scriptSrc = isProduction
    ? builtAssets.jsFile || "/src/main.jsx"
    : `http://localhost:${vitePort}/src/main.jsx`;

  const cssLink =
    isProduction && builtAssets.cssFile
      ? `<link rel="stylesheet" href="${builtAssets.cssFile}" />`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Denied Access</title>
    <meta name="description" content="Access to this resource is denied." />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${
      webLogo ? `<link rel="icon" type="image/x-icon" href="${webLogo}" />` : ""
    }
    ${webLogo ? `<link rel="apple-touch-icon" href="${webLogo}" />` : ""}
    ${webLogo ? `<link rel="shortcut icon" href="${webLogo}" />` : ""}
    ${cssLink}
    <style>
      ${lazyLoadingCSS}
    </style>
    ${
      !isProduction
        ? `<script type="module">
      import RefreshRuntime from 'http://localhost:${vitePort}/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`
        : ""
    }
  </head>
  <body>
    <div id="root">
      <div class="loading-overlay">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Access Denied</p>
        </div>
      </div>
    </div>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
}

// Generate Admin Login Page
function generateAdminLoginPage(webLogo) {
  const scriptSrc = isProduction
    ? builtAssets.jsFile || "/src/main.jsx"
    : `http://localhost:${vitePort}/src/main.jsx`;

  const cssLink =
    isProduction && builtAssets.cssFile
      ? `<link rel="stylesheet" href="${builtAssets.cssFile}" />`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Admin Login</title>
    <meta name="description" content="Admin authentication portal." />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${
      webLogo ? `<link rel="icon" type="image/x-icon" href="${webLogo}" />` : ""
    }
    ${webLogo ? `<link rel="apple-touch-icon" href="${webLogo}" />` : ""}
    ${webLogo ? `<link rel="shortcut icon" href="${webLogo}" />` : ""}
    ${cssLink}
    <style>
      ${lazyLoadingCSS}
    </style>
    ${
      !isProduction
        ? `<script type="module">
      import RefreshRuntime from 'http://localhost:${vitePort}/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`
        : ""
    }
  </head>
  <body>
    <div id="root">
      <div class="loading-overlay">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Admin Authentication</p>
        </div>
      </div>
    </div>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
}

// Generate Admin Dashboard Page
function generateAdminDashboardPage(webLogo) {
  const scriptSrc = isProduction
    ? builtAssets.jsFile || "/src/main.jsx"
    : `http://localhost:${vitePort}/src/main.jsx`;

  const cssLink =
    isProduction && builtAssets.cssFile
      ? `<link rel="stylesheet" href="${builtAssets.cssFile}" />`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Admin Dashboard</title>
    <meta name="description" content="Administrative dashboard and control panel." />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${
      webLogo ? `<link rel="icon" type="image/x-icon" href="${webLogo}" />` : ""
    }
    ${webLogo ? `<link rel="apple-touch-icon" href="${webLogo}" />` : ""}
    ${webLogo ? `<link rel="shortcut icon" href="${webLogo}" />` : ""}
    ${cssLink}
    <style>
      ${lazyLoadingCSS}
    </style>
    ${
      !isProduction
        ? `<script type="module">
      import RefreshRuntime from 'http://localhost:${vitePort}/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`
        : ""
    }
    <!-- SSR Page Context -->
    <script>
      window.__SSR_CONTEXT__ = {
        pageType: 'admin-dashboard',
        skipSEO: true,
        title: 'Admin Dashboard',
        description: 'Administrative dashboard and control panel.'
      };
    </script>
  </head>
  <body>
    <div id="root">
      <div class="loading-overlay">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Loading Dashboard</p>
        </div>
      </div>
    </div>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
}

// Enhanced HTML generation with complete SEO coverage (for main pages only)
function generateHTML(seoData, pathname) {
  const { staticData, pageData } = seoData;

  // Extract all available data from APIs
  const title = pageData.Title;
  const description = pageData.Description;
  const keywords = pageData.Keywords;
  const author = staticData.Author;
  const siteName = staticData.WebsiteName;
  const langCode = staticData.LangCode;
  const language = staticData.Lang;
  const countryCode = staticData.CountryCode;
  const city = staticData.City;
  const geographic = staticData.Geographic;
  const icbm = staticData.ICBM;
  const webLogo = staticData.WebLogo;

  // Page-specific social media data
  const socialTitle = pageData.SocialTitle;
  const socialDescription = pageData.SocialDescription;
  const socialImage = pageData.SocialImage;
  const twitterTitle = pageData.TwitterTitle;
  const twitterDescription = pageData.TwitterDescription;
  const twitterImage = pageData.TwitterImage;
  const pageUrl = pageData.PageUrl;

  const baseUrl = isProduction
    ? "https://yourdomain.com"
    : `http://localhost:${port}`;
  const canonicalUrl = pageUrl || `${baseUrl}${pathname}`;

  // Enhanced structured data with all available information
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    ...(siteName && { name: siteName }),
    ...(author && {
      author: {
        "@type": "Person",
        name: author,
      },
    }),
    url: canonicalUrl,
    ...(description && { description }),
    ...(langCode && { inLanguage: langCode }),
  };

  // Use dynamic asset paths in production, Vite dev server in development
  const scriptSrc = isProduction
    ? builtAssets.jsFile || "/src/main.jsx"
    : `http://localhost:${vitePort}/src/main.jsx`;

  const cssLink =
    isProduction && builtAssets.cssFile
      ? `<link rel="stylesheet" href="${builtAssets.cssFile}" />`
      : "";

  // Build comprehensive meta tags
  const metaTags = [
    // Basic meta tags
    title && `<title>${title}</title>`,
    description && `<meta name="description" content="${description}" />`,
    keywords &&
      Array.isArray(keywords) &&
      keywords.length > 0 &&
      `<meta name="keywords" content="${keywords.join(", ")}" />`,
    author && `<meta name="author" content="${author}" />`,
    language && `<meta name="language" content="${language}" />`,

    // Geographic meta tags
    countryCode && `<meta name="geo.region" content="${countryCode}" />`,
    city && `<meta name="geo.placename" content="${city}" />`,
    geographic && `<meta name="geo.position" content="${geographic}" />`,
    icbm && `<meta name="ICBM" content="${icbm}" />`,

    // Robots and viewport
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,

    // Open Graph tags
    (socialTitle || title) &&
      `<meta property="og:title" content="${socialTitle || title}" />`,
    (socialDescription || description) &&
      `<meta property="og:description" content="${
        socialDescription || description
      }" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    siteName && `<meta property="og:site_name" content="${siteName}" />`,
    langCode && `<meta property="og:locale" content="${langCode}" />`,
    socialImage && `<meta property="og:image" content="${socialImage}" />`,
    socialImage && `<meta property="og:image:width" content="1200" />`,
    socialImage && `<meta property="og:image:height" content="630" />`,
    socialImage && `<meta property="og:image:type" content="image/png" />`,

    // Twitter Card tags
    `<meta name="twitter:card" content="summary_large_image" />`,
    (twitterTitle || socialTitle || title) &&
      `<meta name="twitter:title" content="${
        twitterTitle || socialTitle || title
      }" />`,
    (twitterDescription || socialDescription || description) &&
      `<meta name="twitter:description" content="${
        twitterDescription || socialDescription || description
      }" />`,
    (twitterImage || socialImage) &&
      `<meta name="twitter:image" content="${twitterImage || socialImage}" />`,

    // Additional SEO meta tags
    `<meta name="format-detection" content="telephone=no" />`,
    `<meta name="theme-color" content="#ffffff" />`,
    langCode && `<meta http-equiv="content-language" content="${langCode}" />`,

    // Canonical URL
    `<link rel="canonical" href="${canonicalUrl}" />`,

    // Dynamic favicon from API
    webLogo && `<link rel="icon" type="image/x-icon" href="${webLogo}" />`,
    webLogo && `<link rel="apple-touch-icon" href="${webLogo}" />`,
    webLogo && `<link rel="shortcut icon" href="${webLogo}" />`,

    // Alternative language versions (if applicable)
    langCode &&
      langCode !== "en" &&
      `<link rel="alternate" hreflang="en" href="${canonicalUrl}" />`,
    langCode &&
      `<link rel="alternate" hreflang="${langCode}" href="${canonicalUrl}" />`,
  ]
    .filter(Boolean)
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="${langCode || "en"}">
  <head>
    <meta charset="UTF-8" />
    ${metaTags}
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
    
    ${cssLink}
    <style>
      ${lazyLoadingCSS}
    </style>
    ${
      !isProduction
        ? `<script type="module">
      import RefreshRuntime from 'http://localhost:${vitePort}/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`
        : ""
    }
  </head>
  <body>
    <div id="root">
      <div class="loading-overlay">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">${title || "Loading..."}</p>
        </div>
      </div>
    </div>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
}

// Main middleware - enhanced route handling with fixed admin routing
app.use(async (req, res, next) => {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // In both dev and production, skip SSR for these types of requests
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/@") || // Vite internal routes
      pathname.includes(".") || // Any file with extension
      pathname.startsWith("/assets/")
    ) {
      return next();
    }

    // Get static logo for special pages
    const webLogo = await getStaticLogo();

    // Normalize admin URL paths - ensure they start with /
    const normalizedAdminUrl = VITE_FRONTEND_ADMIN_URL.startsWith("/")
      ? VITE_FRONTEND_ADMIN_URL
      : `/${VITE_FRONTEND_ADMIN_URL}`;

    const normalizedAdminDashboard = `${normalizedAdminUrl}/dashboard`;

    // Handle specific special routes first
    if (pathname === "/denied") {
      const html = generateDeniedPage(webLogo);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.send(html);
    }

    // Handle admin login page - exact match
    if (pathname === normalizedAdminUrl) {
      const html = generateAdminLoginPage(webLogo);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.send(html);
    }

    // Handle admin dashboard page - exact match
    if (pathname === normalizedAdminDashboard) {
      const html = generateAdminDashboardPage(webLogo);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.send(html);
    }

    // Check if this is a main SEO page
    const mainPages = ["/", "/projects", "/skills", "/cv", "/contact"];
    const isMainPage = mainPages.includes(pathname);

    if (isMainPage) {
      // Fetch SEO data for main pages
      const seoData = await fetchSEOData(pathname);

      // Generate HTML with dynamic SEO data
      const html = generateHTML(seoData, pathname);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.send(html);
    }

    // For any other route that doesn't match main pages, admin pages, or special routes, show 404
    const html = generate404Page(webLogo);
    res.status(404);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(html);
  } catch (error) {
    console.error("💥 SSR Error:", error);

    const fallbackScriptSrc = isProduction
      ? builtAssets.jsFile || "/src/main.jsx"
      : `http://localhost:${vitePort}/src/main.jsx`;

    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio - Loading Error</title>
  </head>
  <body>
    <div id="root">
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: system-ui;">
        <div style="text-align: center;">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Unable to load content</h1>
          <p style="color: #6b7280;">Please try refreshing the page.</p>
        </div>
      </div>
    </div>
    <script type="module" src="${fallbackScriptSrc}"></script>
  </body>
</html>`;

    res.status(500).setHeader("Content-Type", "text/html").send(fallbackHtml);
  }
});

// 404 handler (fallback)
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Also update the server startup console log for clarity
app.listen(port, () => {
  // Normalize admin paths for display
  const normalizedAdminUrl = VITE_FRONTEND_ADMIN_URL.startsWith("/")
    ? VITE_FRONTEND_ADMIN_URL
    : `/${VITE_FRONTEND_ADMIN_URL}`;
  const normalizedAdminDashboard = `${normalizedAdminUrl}/dashboard`;

  console.log(`\n🚀 SSR Server running on http://localhost:${port}`);
  console.log(`🔗 Backend API: ${Backend_Root_Url}`);
  console.log(`🔒 Admin URL: ${normalizedAdminUrl}`);
  console.log(`🔒 Admin Dashboard: ${normalizedAdminDashboard}`);
  console.log(`🚫 Denied Access: /denied`);
  if (!isProduction) {
    console.log(`🎯 Vite Dev Server: http://localhost:${vitePort}`);
  } else {
    console.log(`🔍 Built JS: ${builtAssets.jsFile || "NOT FOUND"}`);
    console.log(`🔍 Built CSS: ${builtAssets.cssFile || "NOT FOUND"}`);
  }
  console.log(`🔍 Environment: ${isProduction ? "Production" : "Development"}`);
  console.log(
    `🔍 Serving from: ${
      isProduction ? "dist/client" : "public + Vite dev server"
    }`
  );
  console.log(`✅ LazyLoading CSS: ${lazyLoadingCSS ? "Loaded" : "Not Found"}`);
  console.log(
    `📋 Note: ${
      isProduction
        ? "Static assets from dist/client"
        : "All JS modules handled by Vite dev server"
    }\n`
  );
  console.log(`📄 Route Mapping:`);
  console.log(`   • Main Pages (SEO): /, /projects, /skills, /cv, /contact`);
  console.log(`   • Admin Login: ${normalizedAdminUrl}`);
  console.log(`   • Admin Dashboard: ${normalizedAdminDashboard}`);
  console.log(`   • Access Denied: /denied`);
  console.log(`   • 404 Not Found: All other routes\n`);
});
