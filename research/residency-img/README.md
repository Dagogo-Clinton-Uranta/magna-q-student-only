# Residency IMG research

The 2026 snapshot checks all 2,519 ACGME IDs in the residency directory against
their public AMA FREIDA program pages.

- 2,313 programs report a usable IMG percentage.
- 114 program pages do not report the percentage.
- 92 ACGME IDs do not currently resolve to a public FREIDA program page.
- 0 checks ended with an unresolved network or parsing error.

FREIDA labels resident/fellow characteristics as three-year averages. The
import therefore stores this value as `img_resident_share` with
`period_kind = 'three_year_average'`. It must not be described as an IMG
applicant acceptance rate or as an annual Match result.

Run `npm run research:residency-img` to resume incomplete checks and regenerate
the import migration. The script is rate-limited, retries transient failures,
and checkpoints every 25 programs.
