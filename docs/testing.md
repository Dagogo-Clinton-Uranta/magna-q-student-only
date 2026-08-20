# Testing

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:integration`
- `npm run test:db`
- `npm run test:e2e`
- `npm run build`

`test:db` uses isolated PostgreSQL with Supabase-owned schema stubs and exercises authoring, assignment, approval, publication, selection and answering. A full local Supabase stack is still required for storage and complete RLS/browser flows.

Install k6 and run `k6 run scripts/load-study.js` with `APP_URL`, `AUTH_COOKIE`, `EXAM_ID` and `SUBJECT_ID`. Local load results show regressions; they do not prove unlimited scale.
