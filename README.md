# teske.sh

A minimal coming-soon page built with React, TypeScript, and Vite.

## Local development

Use Node.js 22.12+ (or a newer supported LTS version).

```sh
npm ci
npm run dev
```

`npm run build` checks TypeScript and produces `dist/`. `npm run preview` previews that build.

## Deploy with Cloudflare Workers

The site is deployed as the `teske-sh` Worker at https://teske.sh.

To enable automatic deployments from GitHub, connect `dteske25/teske.sh` to the existing Worker with:

- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The checked-in `wrangler.jsonc` serves `dist/` as static assets with SPA fallback. No server entry point or runtime secrets are needed.

The checked-in route `teske.sh/*` sends requests to this Worker. The existing apex A record is proxied through Cloudflare; keep proxying enabled for the route to work. Email DNS records are unchanged.

For manual deployment, run `npx wrangler login` once, then `npm run deploy`. The initial production deployment was made through Wrangler; automatic GitHub deployments are not configured.

If using Cloudflare Pages instead, choose build command `npm run build` and output directory `dist`. Pages handles SPA fallback when no top-level `404.html` exists. Add `teske.sh` in the project's Custom domains settings.

See the [Cloudflare SPA documentation](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/).
