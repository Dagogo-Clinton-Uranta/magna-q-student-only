# ADR 0004: Runtime baseline and current dependency advisory

Status: accepted (2026-07-20)

Target Node.js 24 for local development, CI, and production. The package engine,
version-manager files, and CI workflow pin the same major so runtime behavior is
consistent. Older Node releases are unsupported for this project.

As of this setup, `npm audit --omit=dev` reports the PostCSS advisory GHSA-qx2v-qp2m-jg93 through Next.js. npm offers only an invalid breaking downgrade to Next 9, so no forced audit mutation is applied. Recheck and upgrade to the first patched compatible Next.js release before release deployment.
