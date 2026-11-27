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
2. The Teske.sh consulting admin application in Cloudflare Access protects `teske.sh/admin` and `teske.sh/api/admin`. Sign in as `daric@teske.sh` using the emailed one-time code. The homepage and `/api/inquiries` remain public.
3. The Worker uses `ACCESS_ISSUER` and `ACCESS_AUDIENCE` in `wrangler.jsonc` to verify signed Access tokens for the portal page and its API. Update them if the Access application is replaced. Keep `LOCAL_ADMIN_PASSWORD` for local development.
4. After deploy, confirm a signed-out visitor can submit an inquiry and is challenged on `/admin`. Confirm an authorized administrator can see the inquiry and update its project status.

The Worker uses the existing proxied `teske.sh/*` route. New production inquiries are saved before the Worker sends an alert from `leads@alerts.teske.sh` to `info@teske.sh`. Verify that destination in Cloudflare Email Service before deploying. Alerts contain the project type and a link to the portal. Preview builds omit the email binding, so test submissions do not send alerts.

## Pull request previews

Cloudflare Workers Builds runs `npx wrangler preview` for non-production branches. The previews bind to `teske-sh-intake-preview`; apply schema changes there before running a Preview. To target that database explicitly, run from the repository root:

```sh
npx wrangler d1 migrations apply teske-sh-intake-preview --config wrangler.preview-migrations.jsonc --remote
```

Use sample inquiry details in previews. Production sign-in settings are configured separately, so preview deployments leave the admin portal closed unless Preview-specific access is set up.
