# Contributing

Use Node 22+ and pnpm 10+.

```bash
pnpm install
pnpm check
```

Keep the core package framework-neutral. Nuxt, Laravel, and Identity-specific lifecycle behavior belongs in integration packages. New response or error behavior must include focused tests.

Before opening a pull request, run `pnpm pack --dry-run` and verify that no credentials, fixtures, or source-only files are included in the tarball.

