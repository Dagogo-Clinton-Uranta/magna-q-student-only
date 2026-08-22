-- U.S. residency program database schema
-- Dataset research date: 2026-08-21
-- Intended for PostgreSQL 14+
-- IMPORTANT: visa/IMG/program-specific fields marked unknown/not verified in the CSV
-- must not be presented to users as confirmed facts.

BEGIN;

CREATE TABLE IF NOT EXISTS specialties (
    id BIGSERIAL PRIMARY KEY,
    specialty_code VARCHAR(3) UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    specialty_img_accessibility TEXT,
    competitiveness TEXT,
    training_style TEXT,
    what_programs_look_for TEXT,
    signal_2027 TEXT
);

CREATE TABLE IF NOT EXISTS residencies (
    id BIGSERIAL PRIMARY KEY,
    acgme_id VARCHAR(16) UNIQUE NOT NULL,
    program_name TEXT NOT NULL,
    institution_name TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    specialty_id BIGINT NOT NULL REFERENCES specialties(id),
    official_program_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS residency_cycle_profiles (
    id BIGSERIAL PRIMARY KEY,
    residency_id BIGINT NOT NULL REFERENCES residencies(id) ON DELETE CASCADE,
    academic_cycle TEXT NOT NULL,
    eras_status TEXT,
    img_friendliness TEXT,
    img_friendliness_evidence_status TEXT,
    competitiveness TEXT,
    competitiveness_scope TEXT,
    program_values TEXT,
    program_mission TEXT,
    program_practice_identity TEXT,
    program_training_style TEXT,
    usmle_expectations TEXT,
    us_clinical_experience_requirements TEXT,
    year_of_graduation_considerations TEXT,
    research_emphasis TEXT,
    fellowship_opportunities TEXT,
    unique_strengths TEXT,
    potential_drawbacks TEXT,
    ideal_applicant TEXT,
    signal_2027 TEXT,
    signal_considerations TEXT,
    preliminary_track_status TEXT,
    research_date DATE NOT NULL,
    verification_status TEXT,
    UNIQUE(residency_id, academic_cycle)
);

CREATE TABLE IF NOT EXISTS residency_visas (
    id BIGSERIAL PRIMARY KEY,
    residency_id BIGINT NOT NULL REFERENCES residencies(id) ON DELETE CASCADE,
    academic_cycle TEXT NOT NULL,
    visa_friendliness TEXT,
    visa_filter_ready BOOLEAN NOT NULL DEFAULT FALSE,
    j1_sponsorship TEXT,
    h1b_sponsorship TEXT,
    f1_opt_acceptance TEXT,
    visa_notes TEXT,
    research_date DATE NOT NULL,
    source_url TEXT,
    UNIQUE(residency_id, academic_cycle)
);

CREATE TABLE IF NOT EXISTS residency_sources (
    id BIGSERIAL PRIMARY KEY,
    residency_id BIGINT NOT NULL REFERENCES residencies(id) ON DELETE CASCADE,
    academic_cycle TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_status TEXT,
    checked_on DATE,
    UNIQUE(residency_id, academic_cycle, source_type, source_url)
);

-- Useful filters
CREATE INDEX IF NOT EXISTS idx_residencies_state_city
    ON residencies(state, city);
CREATE INDEX IF NOT EXISTS idx_residencies_specialty
    ON residencies(specialty_id);
CREATE INDEX IF NOT EXISTS idx_cycle_eras_status
    ON residency_cycle_profiles(academic_cycle, eras_status);
CREATE INDEX IF NOT EXISTS idx_cycle_img_friendliness
    ON residency_cycle_profiles(academic_cycle, img_friendliness);
CREATE INDEX IF NOT EXISTS idx_visa_friendliness
    ON residency_visas(academic_cycle, visa_friendliness)
    WHERE visa_filter_ready = TRUE;
CREATE INDEX IF NOT EXISTS idx_visa_j1
    ON residency_visas(academic_cycle, j1_sponsorship)
    WHERE visa_filter_ready = TRUE;
CREATE INDEX IF NOT EXISTS idx_visa_h1b
    ON residency_visas(academic_cycle, h1b_sponsorship)
    WHERE visa_filter_ready = TRUE;

-- Optional text search across program/institution/location.
CREATE INDEX IF NOT EXISTS idx_residencies_program_name_trgm
    ON residencies USING btree (program_name);

COMMIT;

-- Import strategy for Codex:
-- 1. Read us_residencies_1000_2026-08-21.csv.
-- 2. Upsert specialties by specialty_code.
-- 3. Upsert residencies by acgme_id.
-- 4. Upsert residency_cycle_profiles using (residency_id, academic_cycle).
-- 5. Upsert residency_visas using (residency_id, academic_cycle).
-- 6. Insert AAMC ERAS and Residency Explorer source rows into residency_sources.
--
-- Example filters after visa enrichment:
--
-- SELECT r.program_name, r.city, r.state, s.name, v.j1_sponsorship, v.h1b_sponsorship
-- FROM residencies r
-- JOIN specialties s ON s.id = r.specialty_id
-- JOIN residency_visas v ON v.residency_id = r.id
-- WHERE r.state = 'New York'
--   AND s.name = 'Internal Medicine'
--   AND v.visa_filter_ready = TRUE
--   AND v.j1_sponsorship = 'yes';
--
-- SELECT r.program_name, r.city, r.state, s.name
-- FROM residencies r
-- JOIN specialties s ON s.id = r.specialty_id
-- JOIN residency_visas v ON v.residency_id = r.id
-- WHERE s.name = 'Family Medicine'
--   AND v.visa_friendliness IN ('friendly', 'moderately_friendly')
-- ORDER BY r.state, r.city, r.program_name;
