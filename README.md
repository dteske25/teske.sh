# teske.sh

Teske.sh is a software consulting site with a project inquiry form and a private lead and project portal. Inquiries are saved in Cloudflare D1. The portal lists them under **Leads**. Add a project name to a lead to track it under **Projects**. The portal supports lead status, project status, and private notes.

## Local development

Use Node.js 22.12+.

```sh
npm ci
npm run build
npx wrangler d1 migrations apply DB --local
npx wrangler dev
```

Open the local Worker URL for the full flow. To test the portal, add `LOCAL_ADMIN_PASSWORD` with a local-only password to the ignored `.dev.vars` file. Open `http://localhost:8787/admin` and enter `admin` and that password. Keep this variable in local development only. `npm run dev` serves the frontend through Vite and is suitable for layout work.

## Production setup

Cloudflare Workers Builds deploys the `teske-sh` Worker from `main`. Prepare the production resources before merging this change.

1. The `DB` binding in `wrangler.jsonc` points to the production `teske-sh-intake` database. Before production deploys with schema changes, run `npx wrangler d1 migrations apply DB --remote`. GitHub checks the build and Worker bundle on pull requests.
2. Create one Cloudflare Access self-hosted application that protects both `teske.sh/admin` and `teske.sh/api/admin`, including their subpaths. Restrict the allow policy to the intended administrator account. Keep the homepage and `/api/inquiries` public.
3. Set the Worker variables `ACCESS_ISSUER` to your Cloudflare Access team origin (for example, `https://your-team.cloudflareaccess.com`) and `ACCESS_AUDIENCE` to that application’s audience tag. The Worker verifies the signed Access token for both portal pages and private API calls. Retain these variables across deploys. Do not set `LOCAL_ADMIN_PASSWORD` in production.
4. After deploy, confirm a signed-out visitor can submit an inquiry and is challenged on `/admin`. Confirm an authorized administrator can see the inquiry and update its project status.

The Worker uses the existing proxied `teske.sh/*` route. Lead intake is stored and reviewed in the portal. Email alerts are a separate integration.

## Pull request previews

Cloudflare Workers Builds runs `npx wrangler preview` for non-production branches. The previews bind to `teske-sh-intake-preview`; apply schema changes there before running a Preview. To target that database explicitly, run from the repository root:

```sh
npx wrangler d1 migrations apply teske-sh-intake-preview --config wrangler.preview-migrations.jsonc --remote
```

Use sample inquiry details in previews. Production sign-in settings are configured separately, so preview deployments leave the admin portal closed unless Preview-specific access is set up.
