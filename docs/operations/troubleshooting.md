# When a step breaks

Find the step, read its log, apply the fix. The pages of each action carry
their own table of errors; this one covers what lies between them.

## Read the failure

A failed CI run:

```powershell
gh run list --limit 5
```

```powershell
gh run view <id> --log-failed
```

Expected: the log of the failing step only. Re-run it once the cause is fixed
— or straight away for a network hiccup:

```powershell
gh run rerun <id> --failed
```

## By step

| Step                  | Symptom                                           | Fix                                                                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CI `pnpm install`     | `ERR_PNPM_OUTDATED_LOCKFILE`                      | `pnpm install` here, commit `pnpm-lock.yaml`, ship.                                                                                                                                                                                                                      |
| CI _Lint_             | `biome ci` errors                                 | `pnpm lint` here, commit, ship.                                                                                                                                                                                                                                          |
| CI _Spell_            | `Unknown word`                                    | Fix the typo, or add a real word to `cspell.json` → `words`.                                                                                                                                                                                                             |
| CI _Build_ or _Test_  | A failing test or type error                      | Reproduce with `pnpm validate` here; fix; ship.                                                                                                                                                                                                                          |
| CI _Install Chromium_ | `apt-get` or download errors                      | A runner or mirror hiccup: `gh run rerun <id> --failed`.                                                                                                                                                                                                                 |
| CI _Lighthouse_       | A page scores under 100 or exceeds a budget       | Download the run's `lighthouse-reports` artifact (`gh run download <id> -n lighthouse-reports`), read the failing audit, reproduce with `pnpm build; pnpm lighthouse`.                                                                                                   |
| CI _Deploy_           | Step _skipped_                                    | The repository lacks `CLOUDFLARE_API_TOKEN`: `pnpm secrets:sync` ([secrets.md](secrets.md)), then `gh run rerun <id>`.                                                                                                                                                   |
| CI _Deploy_           | `Authentication error [code: 10000]`              | The Cloudflare token expired or lost a permission: renew it ([secrets.md](secrets.md)).                                                                                                                                                                                  |
| CI _Deploy_           | The project is not found                          | The hosting is gone: recreate it ([hosting.md](hosting.md)).                                                                                                                                                                                                             |
| CI `actionlint` job   | An error in `.github/workflows/ci.yml`            | Fix the expression or key it names; commit, ship.                                                                                                                                                                                                                        |
| Site                  | Old version still showing                         | The service worker swaps a new version in on its own, but only on the hub or before the first touch (`src/infrastructure/pwa/app-update.ts`): go back to the hub, or reload and wait a moment before touching anything. Check the CI run deployed the commit you expect. |
| Site                  | Blank page, console errors                        | Undo the deploy ([deploying.md](deploying.md)), then reproduce locally with `pnpm build; pnpm preview`.                                                                                                                                                                  |
| Any script            | A `Bitwarden …` message                           | [secrets.md](secrets.md), _Common errors_.                                                                                                                                                                                                                               |
| Any script            | `pnpm: command not found` or a wrong pnpm version | `corepack enable`, open a new terminal.                                                                                                                                                                                                                                  |

## Still stuck

- Cloudflare status: https://www.cloudflarestatus.com — GitHub:
  https://www.githubstatus.com
- Deploy by hand, from a clean clone of `main`, with the token read from
  Bitwarden: [hosting.md](hosting.md), _Deploy by hand_.
