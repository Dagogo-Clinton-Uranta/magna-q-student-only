# Architecture

MediNexus is a Next.js modular monolith deployed as one application, backed by Supabase Auth, PostgreSQL and private Storage. Server Components render private pages; narrow Route Handlers and PostgreSQL functions own mutations. RLS and security-definer functions form the data boundary.

```mermaid
flowchart LR
  Phone[Mobile browser] --> Next[Next.js application]
  Next --> Auth[Supabase Auth]
  Next --> RPC[PostgreSQL RPCs]
  RPC --> DB[(PostgreSQL + RLS)]
  Next --> Storage[Private question images]
```

## Core data model

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : owns
  EXAMS ||--o{ QUESTIONS : scopes
  EXAMS ||--o{ TEST_BLOCKS : scopes
  SUBJECTS ||--o{ QUESTION_SUBJECTS : classifies
  QUESTIONS ||--o{ QUESTION_SUBJECTS : has
  QUESTIONS ||--o{ QUESTION_OPTIONS : offers
  QUESTIONS ||--o{ QUESTION_REVIEWS : receives
  PROFILES ||--o{ QUESTION_REVIEWS : performs
  PROFILES ||--o{ TEST_BLOCKS : creates
  TEST_BLOCKS ||--|{ TEST_BLOCK_QUESTIONS : fixes
  QUESTIONS ||--o{ TEST_BLOCK_QUESTIONS : appears_in
  TEST_BLOCKS ||--o{ QUESTION_ATTEMPTS : records
  QUESTIONS ||--o{ QUESTION_ATTEMPTS : answered
  QUESTION_OPTIONS ||--o{ QUESTION_ATTEMPTS : selected
  PROFILES ||--o{ QUESTION_MARKS : marks
  PROFILES ||--o{ QUESTION_NOTES : writes
  QUESTIONS ||--o{ ERROR_REPORTS : reported
  QUESTIONS ||--o{ MEDICAL_LIBRARY_ENTRIES : references
```

Taxonomy junctions for systems, disciplines and categories follow the same pattern as `question_subjects`. Block membership is immutable once generated; attempt rows use submission keys for idempotency.

## Answer request flow

```mermaid
sequenceDiagram
  participant U as Student
  participant A as Route Handler
  participant D as PostgreSQL
  U->>A: Submit opaque option ID + idempotency key
  A->>D: Authenticated answer RPC
  D->>D: Validate owner, block, question and option
  D-->>A: State-shaped tutor/timed response
  A-->>U: No early content beyond authorised mode
```
