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

Connect `dteske25/teske.sh` in Cloudflare Workers & Pages and create a Worker with:

- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The checked-in `wrangler.jsonc` serves `dist/` as static assets with SPA fallback. No server entry point or runtime secrets are needed.

After deploying, add `teske.sh` under the Worker's Settings → Domains & Routes as a Custom domain. The zone must be in the same Cloudflare account.

For manual deployment, run `npx wrangler login` once, then `npm run deploy`.

If using Cloudflare Pages instead, choose build command `npm run build` and output directory `dist`. Pages handles SPA fallback when no top-level `404.html` exists. Add `teske.sh` in the project's Custom domains settings.

See the [Cloudflare SPA documentation](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/).
