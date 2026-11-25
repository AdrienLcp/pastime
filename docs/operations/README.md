# Operations

Everything needed to run this app without help: one page per action, each
with its prerequisites, the exact command, what a good run prints, and the
errors met most often.

| Action                         | Command               | Page                                                 |
| ------------------------------ | --------------------- | ---------------------------------------------------- |
| Deploy                         | `pnpm ship`           | [deploying.md](deploying.md)                         |
| Update the dependencies        | `pnpm deps:upgrade`   | [updating-dependencies.md](updating-dependencies.md) |
| Create or recreate the hosting | `pnpm hosting:create` | [hosting.md](hosting.md)                             |
| Set or renew the secrets       | `pnpm secrets:sync`   | [secrets.md](secrets.md)                             |
| A step broke                   | —                     | [troubleshooting.md](troubleshooting.md)             |

## Where things live

| What                  | Where                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| The site              | https://pastime.adrienlcp.com — Cloudflare Pages project `pastime`, deployed by CI                |
| Repository            | `AdrienLcp/pastime` on GitHub; a push to `main` runs `.github/workflows/ci.yml`                   |
| Secrets               | The personal Bitwarden account, read at run time; never a file in this repository, never a `.env` |
| Hosting identifiers   | `scripts/operations/hosting.ts`                                                                   |
| Bitwarden entry names | `scripts/operations/secret-entries.ts`                                                            |

## Tools on the machine

- Node 26 and pnpm through corepack (`corepack enable`), as `package.json` pins them.
- The Bitwarden CLI, `bw` — set up once, see [secrets.md](secrets.md).
- The GitHub CLI, `gh`, logged in (`gh auth status`) — `pnpm ship` uses it to
  follow the CI run. Without it, `pnpm ship` still pushes and prints the
  Actions page to watch.
