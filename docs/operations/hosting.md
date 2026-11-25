# Hosting

| Piece       | Provider                              | Identifier (`scripts/operations/hosting.ts`)                  |
| ----------- | ------------------------------------- | ------------------------------------------------------------- |
| The site    | Cloudflare Pages, account `431a5290…` | project `pastime`                                             |
| Its address | Cloudflare DNS, zone `adrienlcp.com`  | proxied `CNAME pastime.adrienlcp.com → pastime-2e1.pages.dev` |

The CI secrets that let GitHub deploy to Cloudflare are covered in
[secrets.md](secrets.md).

## Create or recreate it — `pnpm hosting:create`

Creates whichever piece is missing and leaves the others alone: run it before
the first deploy, after deleting the project by mistake, or just to check. It
never deletes or changes an existing piece. The project it creates is a
direct-upload one, which the CI's deploy step fills.

Prerequisite: the Bitwarden entry `Cloudflare Pages token`
([secrets.md](secrets.md)).

```powershell
pnpm hosting:create
```

Expected, when everything exists:

```text
hosting:create: Pages project pastime exists
hosting:create: pastime.adrienlcp.com is attached to the Pages project
hosting:create: DNS pastime.adrienlcp.com → pastime-2e1.pages.dev exists
hosting:create: done: …
```

Each missing piece prints `created` or `attached` instead.

After creating or recreating the Pages project:

1. Cloudflare gives it a `pages.dev` host with a suffix — today's project
   is `pastime-2e1.pages.dev`; a recreated one gets another suffix. The
   script points the DNS at it. Replace the host in `public/_headers`, so
   the `pages.dev` copy stays out of search engines:

   ```text
   https://<host>.pages.dev/*
     X-Robots-Tag: noindex

   https://:deployment.<host>.pages.dev/*
     X-Robots-Tag: noindex
   ```

2. `pnpm secrets:sync` if the GitHub secrets are new or were lost too.
3. Deploy: push a commit with `pnpm ship`, or re-run the last CI run
   (`gh run rerun <id>`). The custom domain answers once its certificate is
   issued, a few minutes after attaching.

## Deploy by hand

The last resort, when CI cannot deploy: from a clean clone of `main` only (it
ships whatever the folder holds). Unlock first ([secrets.md](secrets.md),
_Unlocking_), then in that terminal:

```powershell
pnpm install --frozen-lockfile; pnpm build
```

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "431a529079f2d76802b95056e39950f0"; $env:CLOUDFLARE_API_TOKEN = bw get password "Cloudflare Pages token"; pnpm dlx wrangler@4 pages deploy dist --project-name pastime --branch main
```

Close the terminal afterwards: it holds the token.

## Common errors

| Message                                                     | Fix                                                                                                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `Bitwarden …` message                                     | See [secrets.md](secrets.md).                                                                                                                             |
| `… answered 403` with `Authentication error` (code `10000`) | The Cloudflare token lacks a permission listed in [secrets.md](secrets.md), or expired: renew it.                                                         |
| `… answered 409` on the Pages project                       | The name `pastime` is taken by a project of another kind (a Worker): rename it in `hosting.ts` and in `.github/workflows/ci.yml`.                         |
| `DNS pastime.adrienlcp.com points to …, not …`              | A record exists with another target: in the dashboard, _adrienlcp.com → DNS → Records_, edit it to the `pages.dev` host printed.                          |
| The site answers `522` or a certificate error               | The certificate is not issued yet: wait ten minutes. Still failing: dashboard → _Workers & Pages → pastime → Custom domains_, and follow what it reports. |
