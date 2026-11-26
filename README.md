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

1. Create a D1 database named `teske-sh-intake`, then replace the local placeholder database ID in `wrangler.jsonc` with the production ID. Apply `npx wrangler d1 migrations apply DB --remote` after the binding points to that database.
2. Create one Cloudflare Access self-hosted application that protects both `teske.sh/admin` and `teske.sh/api/admin`, including their subpaths. Restrict the allow policy to the intended administrator account. Keep the homepage and `/api/inquiries` public.
3. Set the Worker variables `ACCESS_ISSUER` to your Cloudflare Access team origin (for example, `https://your-team.cloudflareaccess.com`) and `ACCESS_AUDIENCE` to that application’s audience tag. The Worker verifies the signed Access token for both portal pages and private API calls. Retain these variables across deploys. Do not set `LOCAL_ADMIN_PASSWORD` in production.
4. After deploy, confirm a signed-out visitor can submit an inquiry and is challenged on `/admin`. Confirm an authorized administrator can see the inquiry and update its project status.

The Worker uses the existing proxied `teske.sh/*` route. Lead intake is stored and reviewed in the portal. Email alerts are a separate integration.
