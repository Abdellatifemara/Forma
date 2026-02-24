// Cloudflare Worker — rewrite dynamic routes to _placeholder pages
// When a user visits /trainers/real-id, we serve /trainers/_placeholder/index.html
// but the browser URL stays as /trainers/real-id. The page JS reads the real ID
// from window.location.pathname.

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
  // Workout programs (before /workouts/:id)
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
    const htmlPath = isRSC ? matchPath.slice(0, -4) : matchPath;

    // Check dynamic route patterns
    for (const [pattern, placeholder] of DYNAMIC_ROUTES) {
      if (pattern.test(htmlPath)) {
        // IMPORTANT: Always request the full file path (index.html / index.txt)
        // to avoid Cloudflare returning a 301 redirect to the trailing-slash version,
        // which would change the browser URL to show _placeholder.
        const filePath = placeholder + (isRSC ? '/index.txt' : '/index.html');
        const rewrittenUrl = new URL(request.url);
        rewrittenUrl.pathname = filePath;

        const asset = await env.ASSETS.fetch(new Request(rewrittenUrl.toString(), request));
        if (asset.ok) {
          // Return the asset with the original URL (no redirect)
          return new Response(asset.body, {
            status: 200,
            headers: asset.headers,
          });
        }
        break;
      }
    }

    // Default: serve from static assets
    const asset = await env.ASSETS.fetch(request);

    // If the asset response is a redirect, follow it transparently
    // (don't let the browser see internal redirects like /foo -> /foo/)
    if (asset.status >= 300 && asset.status < 400) {
      const location = asset.headers.get('location');
      if (location) {
        const redirectUrl = new URL(location, request.url);
        // Only follow internal redirects (same origin)
        if (redirectUrl.origin === url.origin) {
          return env.ASSETS.fetch(new Request(redirectUrl.toString(), request));
        }
      }
    }

    if (asset.ok) {
      return asset;
    }

    // SPA fallback: serve root index.html for truly unknown routes
    const fallbackUrl = new URL(request.url);
    fallbackUrl.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
  },
};
