# Deploying

The CI workflow (`.github/workflows/ci.yml`) runs on every push to `main`:
lint, spelling, build, tests, then Lighthouse on the built site; when all
pass, its _Deploy_ step uploads `dist/` to the Pages project `pastime`. A newer
push cancels the run of the one before. Shipping is pushing; nothing is built
or deployed from this machine.

## Ship — `pnpm ship`

Prerequisites: on `main`, everything committed, `origin/main` pulled.

```powershell
pnpm ship
```

Expected: `git push` output, then `ship: pushed; watching CI run <id>`, the
run's jobs ticking green, and `ship: deployed to https://pastime.adrienlcp.com`.
Open the site and check the change.

| Error                                         | Fix                                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `only main deploys`                           | `git switch main`, merge or cherry-pick the work there.                                                  |
| `the working tree has uncommitted changes`    | Commit (or `git stash`) first.                                                                           |
| `origin/main has commits this checkout lacks` | `git pull --rebase`, then `pnpm validate`, then `pnpm ship`.                                             |
| `nothing to ship`                             | Every commit is already pushed. To re-deploy the same commit, re-run its CI run: `gh run rerun <id>`.    |
| `the CI run failed`                           | Open the run link it prints; see [troubleshooting.md](troubleshooting.md).                               |
| `pushed; follow the deploy on …/actions`      | `gh` is missing or logged out; the push is done, watch the page. `gh auth login` fixes it for next time. |

## Undo a deploy

The way that leaves the history right: revert the commit and ship.

```powershell
git revert <commit>
```

```powershell
pnpm ship
```

Faster, while the fix is prepared: Cloudflare dashboard → _Workers & Pages →
pastime → Deployments_, a previous deployment → _Rollback_. The next deploy
replaces the rollback.
