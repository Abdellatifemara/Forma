// Cloudflare Worker — rewrite dynamic routes to _placeholder pages
// Static assets (JS, CSS, images) are served directly from CDN — no Worker invocations.
// This Worker only runs for routes that don't match a static file.

// Dynamic route patterns: [regex, placeholder_base_path]
const DYNAMIC_ROUTES = [
  // Trainer client sub-pages (more specific first)
  [/^\/trainer\/clients\/(?!_placeholder)[^/]+\/edit/, '/trainer/clients/_placeholder/edit'],
  [/^\/trainer\/clients\/(?!_placeholder)[^/]+\/meal-plan/, '/trainer/clients/_placeholder/meal-plan'],
  // Trainer client detail
  [/^\/trainer\/clients\/(?!_placeholder)[^/]+$/, '/trainer/clients/_placeholder'],
  // Trainer programs
  [/^\/trainer\/programs\/(?!_placeholder)[^/]+$/, '/trainer/programs/_placeholder'],
  // Public trainers
  [/^\/trainers\/(?!_placeholder)[^/]+$/, '/trainers/_placeholder'],
  // Workout programs (before /workouts/:id to avoid matching /workouts/programs)
  [/^\/workouts\/programs\/(?!_placeholder)[^/]+$/, '/workouts/programs/_placeholder'],
  // Workouts (exclude known sub-paths)
  [/^\/workouts\/(?!programs|create|log|generate|_placeholder)[^/]+$/, '/workouts/_placeholder'],
  // Join invite code
  [/^\/join\/(?!_placeholder)[^/]+$/, '/join/_placeholder'],
];

// Convenience redirects
const REDIRECTS = {
  '/app': '/workouts',
  '/trainer': '/trainer/dashboard',
  '/admin': '/admin/dashboard',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Strip trailing slash for matching (except root)
    const matchPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

    // Check convenience redirects first
    if (REDIRECTS[matchPath]) {
      return Response.redirect(new URL(REDIRECTS[matchPath], request.url).toString(), 302);
    }

    // Check if this is a request for RSC data (.txt suffix)
    const isRSC = matchPath.endsWith('.txt');
    const htmlPath = isRSC ? matchPath.slice(0, -4) : matchPath; // Remove .txt

    // Check dynamic route patterns
    for (const [pattern, placeholder] of DYNAMIC_ROUTES) {
      if (pattern.test(htmlPath)) {
        // Build the rewritten URL
        const rewrittenPath = isRSC ? placeholder + '.txt' : placeholder;
        const rewrittenUrl = new URL(request.url);
        rewrittenUrl.pathname = rewrittenPath;

        const asset = await env.ASSETS.fetch(rewrittenUrl);
        if (asset.ok) {
          return asset;
        }

        // Try with /index.html or /index.txt appended
        rewrittenUrl.pathname = placeholder + (isRSC ? '/index.txt' : '/index.html');
        const assetIndex = await env.ASSETS.fetch(rewrittenUrl);
        if (assetIndex.ok) {
          return assetIndex;
        }

        // If neither found, fall through to default
        break;
      }
    }

    // Default: serve from static assets
    // For unmatched routes, try the path as-is, then index.html
    const asset = await env.ASSETS.fetch(request);
    if (asset.ok) {
      return asset;
    }

    // SPA fallback: serve root index.html for truly unknown routes
    const fallbackUrl = new URL(request.url);
    fallbackUrl.pathname = '/index.html';
    return env.ASSETS.fetch(fallbackUrl);
  },
};
