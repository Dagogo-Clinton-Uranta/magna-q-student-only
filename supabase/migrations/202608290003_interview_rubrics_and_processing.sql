begin;

create table public.interview_competency_definitions (
  id text primary key,
  name text not null unique,
  description text not null,
  version text not null,
  anchors jsonb not null check (jsonb_typeof(anchors) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interview_rubric_families (
  id text not null,
  version text not null,
  practice_area text not null,
  criteria jsonb not null check (jsonb_typeof(criteria) = 'array'),
  strong_signals jsonb not null check (jsonb_typeof(strong_signals) = 'array'),
  concerns jsonb not null check (jsonb_typeof(concerns) = 'array'),
  critical_elements jsonb not null default '[]'::jsonb check (jsonb_typeof(critical_elements) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(id, version)
);

create table public.interview_question_rubric_mappings (
  question_id text primary key,
  practice_area text not null,
  question_type text not null check (question_type in ('general','behavioral','situational')),
  competencies text[] not null check (cardinality(competencies) between 3 and 5),
  specialty_relevance text[] not null default array['general']::text[],
  rubric_id uuid not null references public.interview_rubrics(id) on delete restrict,
  rubric_key text not null,
  rubric_version text not null,
  criteria jsonb not null check (jsonb_typeof(criteria) = 'array'),
  critical_elements jsonb not null default '[]'::jsonb check (jsonb_typeof(critical_elements) = 'array'),
  red_flags jsonb not null default '[]'::jsonb check (jsonb_typeof(red_flags) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interview_processing_answers (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null unique references public.interview_videos(id) on delete cascade,
  question_id text not null,
  mock_session_id uuid references public.interview_mock_sessions(id) on delete cascade,
  individual_result_id uuid references public.interview_individual_results(id) on delete cascade,
  mock_position integer check (mock_position between 0 and 7),
  storage_kind text not null check (storage_kind in ('s3','ephemeral')),
  storage_reference text,
  status text not null check (status in (
    'PENDING_UPLOAD','UPLOADED','QUEUED','TRANSCRIBING','TRANSCRIBED',
    'EVALUATING','EVALUATED','FINALIZING','COMPLETED','FAILED'
  )),
  transcript text,
  transcript_words jsonb not null default '[]'::jsonb check (jsonb_typeof(transcript_words) = 'array'),
  transcript_confidence numeric,
  transcript_duration_seconds numeric,
  transcription_request_id text,
  delivery_metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(delivery_metrics) = 'object'),
  evaluation_output jsonb,
  provider_error_code text,
  user_error_message text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (num_nonnulls(mock_session_id, individual_result_id) = 1),
  check ((mock_session_id is null and mock_position is null) or (mock_session_id is not null and mock_position is not null)),
  check (storage_kind <> 's3' or storage_reference is not null)
);
create unique index interview_processing_mock_answer_idx
on public.interview_processing_answers(mock_session_id, mock_position)
where mock_session_id is not null;
create index interview_processing_recovery_idx
on public.interview_processing_answers(status, updated_at);
create index interview_processing_owner_idx
on public.interview_processing_answers(user_id, created_at desc);

create trigger interview_competency_definitions_updated before update on public.interview_competency_definitions
for each row execute function public.set_updated_at();
create trigger interview_rubric_families_updated before update on public.interview_rubric_families
for each row execute function public.set_updated_at();
create trigger interview_question_rubric_mappings_updated before update on public.interview_question_rubric_mappings
for each row execute function public.set_updated_at();
create trigger interview_processing_answers_updated before update on public.interview_processing_answers
for each row execute function public.set_updated_at();

with definitions(id, name, description) as (values
  ('clear-structured-communication','Clear & Structured Communication','a direct, logically ordered answer with a clear central message'),
  ('relevance-concision','Relevance & Concision','selection of relevant detail without avoidable repetition or tangents'),
  ('perspective-taking-listening','Perspective-Taking & Listening','attention to another person''s perspective and evidence of responsive listening'),
  ('respectful-interpersonal-communication','Respectful Interpersonal Communication','clear, respectful communication during routine or difficult interactions'),
  ('adaptability-communication','Adaptability of Communication','communication adjusted appropriately to audience, context, and need'),
  ('professionalism','Professionalism','reliable conduct, appropriate boundaries, and respect for professional responsibilities'),
  ('integrity','Integrity','truthful, principled action despite inconvenience or pressure'),
  ('accountability','Accountability','ownership of decisions, contribution, consequences, and corrective action'),
  ('appropriate-escalation','Appropriate Escalation','timely involvement of the right supervisor, resource, or authority'),
  ('ethical-reasoning','Ethical Reasoning','recognition and balanced analysis of relevant ethical duties and competing considerations'),
  ('team-orientation','Team Orientation','work toward a shared goal while valuing complementary roles and contributions'),
  ('conflict-resolution','Conflict Resolution','direct, respectful resolution of disagreement focused on facts and shared goals'),
  ('receptiveness-feedback','Receptiveness to Feedback','open consideration of feedback without defensiveness and appropriate follow-through'),
  ('self-awareness','Self-Awareness','accurate recognition of personal strengths, limits, reactions, and contribution'),
  ('reflection','Reflection','meaningful interpretation of experience and its implications for future practice'),
  ('behavior-change','Behavior Change','a specific, sustained change resulting from feedback, error, or reflection'),
  ('patient-safety-orientation','Patient-Safety Orientation','prioritization of immediate and longer-term protection from preventable harm'),
  ('recognition-limits','Recognition of Limits','accurate recognition of uncertainty and the boundaries of personal competence'),
  ('prioritization','Prioritization','ordering actions according to urgency, risk, and patient or team need'),
  ('appropriate-initiative-agency','Appropriate Initiative/Agency','constructive action within role, competence, and supervision'),
  ('resilience','Resilience','continued responsible functioning and recovery during or after difficulty'),
  ('adaptive-coping','Adaptive Coping','safe, sustainable strategies for managing stress and maintaining responsibilities'),
  ('help-seeking','Help-Seeking','timely use of people and resources when support or expertise is needed'),
  ('leadership-judgment','Leadership Judgment','appropriate direction and decisions responsive to people, risk, and context'),
  ('delegation-team-enablement','Delegation/Team Enablement','clear delegation that matches roles and enables others to contribute'),
  ('systems-thinking','Systems Thinking','recognition of processes, incentives, constraints, and downstream effects'),
  ('motivation','Motivation','specific, experience-grounded reasons for pursuing medicine, training, or an opportunity'),
  ('specialty-understanding','Specialty Understanding','realistic understanding of a specialty''s work, demands, and contribution'),
  ('program-understanding','Program Understanding','specific and accurate understanding of a program''s distinctive opportunities and context'),
  ('career-alignment','Career Alignment','credible connection between prior experience, training choices, and future direction'),
  ('commitment-training','Commitment to Training','realistic readiness to learn, contribute, and meet residency responsibilities'),
  ('patient-service-orientation','Patient/Service Orientation','focus on patient, community, team, or service outcomes rather than self-promotion'),
  ('cultural-humility','Cultural Humility','curiosity, respect, and recognition of the limits of one''s own perspective'),
  ('recognition-bias-inequity','Recognition of Bias/Inequity','recognition of interpersonal and structural bias, barriers, or unequal outcomes'),
  ('advocacy','Advocacy','appropriate action to address a patient''s, group''s, or system''s identified need'),
  ('evidence-based-reasoning','Evidence-Based Reasoning','appropriate interpretation and application of evidence with uncertainty and limitations'),
  ('understanding-own-research','Understanding of Own Research','accurate explanation of a project''s question, methods, role, findings, and limitations'),
  ('intellectual-curiosity','Intellectual Curiosity','specific inquiry that deepens understanding and guides further learning'),
  ('preparation','Preparation','specific evidence of purposeful research and readiness for the conversation'),
  ('insightful-questioning','Insightful Questioning','useful questions grounded in genuine curiosity and available context')
)
insert into public.interview_competency_definitions(id,name,description,version,anchors)
select id,name,description,'2026.08.1',jsonb_build_object(
  '1','Provides no usable observable evidence of '||description||', or provides materially concerning evidence.',
  '2','Mentions '||description||', but support is vague, incomplete, inconsistent, or mostly hypothetical.',
  '3','Provides credible, specific transcript evidence of '||description||' at the expected residency-practice level.',
  '4','Provides strong, well-selected evidence of '||description||', including relevant action, judgment, or outcome.',
  '5','Provides exceptional, nuanced evidence of '||description||', with clear context, impact, and reflection where relevant.'
) from definitions
on conflict(id) do update set name=excluded.name,description=excluded.description,version=excluded.version,anchors=excluded.anchors;

insert into public.interview_rubric_families(id,version,practice_area,criteria,strong_signals,concerns,critical_elements) values
('communication-interpersonal','2026.08.1','communication-interpersonal','[{"competencyId":"clear-structured-communication","weight":0.25},{"competencyId":"perspective-taking-listening","weight":0.25},{"competencyId":"respectful-interpersonal-communication","weight":0.20},{"competencyId":"adaptability-communication","weight":0.20},{"competencyId":"relevance-concision","weight":0.10}]','["directly answers the question","shows listening or perspective-taking","adapts communication","uses respectful language","describes an outcome"]','["dismisses other perspectives","labels people negatively without reflection","unnecessary confrontation","fails to listen","excessive blame"]','[]'),
('professionalism-integrity','2026.08.1','professionalism-integrity','[{"competencyId":"accountability","weight":0.25},{"competencyId":"professionalism","weight":0.20},{"competencyId":"ethical-reasoning","weight":0.20},{"competencyId":"appropriate-escalation","weight":0.20},{"competencyId":"clear-structured-communication","weight":0.15}]','["takes ownership","does not hide mistakes","protects patients","recognizes the professional issue","escalates appropriately"]','["conceals error","dishonesty","blames others entirely","ignores safety concern","inappropriate retaliation"]','["identify the central professional issue","take a safe action","escalate when required"]'),
('teamwork-collaboration','2026.08.1','teamwork-collaboration','[{"competencyId":"team-orientation","weight":0.25},{"competencyId":"conflict-resolution","weight":0.25},{"competencyId":"perspective-taking-listening","weight":0.20},{"competencyId":"accountability","weight":0.15},{"competencyId":"patient-service-orientation","weight":0.15}]','["seeks perspectives","communicates directly and respectfully","focuses on a shared goal","recognizes own role"]','["treats conflict as winning","unnecessary blame","hero narrative","petty retaliation","poor collaboration"]','[]'),
('self-awareness-reflection','2026.08.1','self-awareness-reflection','[{"competencyId":"self-awareness","weight":0.20},{"competencyId":"accountability","weight":0.25},{"competencyId":"reflection","weight":0.25},{"competencyId":"behavior-change","weight":0.20},{"competencyId":"clear-structured-communication","weight":0.10}]','["owns contribution","identifies a meaningful lesson","describes specific change","shows later improvement","accepts feedback"]','["fake weakness","defensiveness","blames others","generic lesson","no behavior change"]','[]'),
('patient-safety-judgment','2026.08.1','patient-safety-judgment','[{"competencyId":"patient-safety-orientation","weight":0.25},{"competencyId":"prioritization","weight":0.20},{"competencyId":"appropriate-escalation","weight":0.20},{"competencyId":"recognition-limits","weight":0.20},{"competencyId":"clear-structured-communication","weight":0.15}]','["recognizes immediate risk","protects the patient first","acts within competence","asks for appropriate help","considers prevention"]','["delays despite safety risk","acts beyond competence","conceals error","fails to escalate serious concern"]','["recognize immediate safety risk","act within competence","escalate serious concern"]'),
('resilience-adaptability','2026.08.1','resilience-adaptability','[{"competencyId":"resilience","weight":0.20},{"competencyId":"adaptive-coping","weight":0.25},{"competencyId":"appropriate-initiative-agency","weight":0.15},{"competencyId":"help-seeking","weight":0.20},{"competencyId":"reflection","weight":0.20}]','["recognizes challenge realistically","uses constructive coping","adapts approach","maintains responsibilities","seeks help"]','["dangerous overwork presented as resilience","denies stress","maladaptive coping","refuses help","persistent blame"]','[]'),
('leadership-systems','2026.08.1','leadership-systems','[{"competencyId":"leadership-judgment","weight":0.20},{"competencyId":"delegation-team-enablement","weight":0.20},{"competencyId":"clear-structured-communication","weight":0.20},{"competencyId":"systems-thinking","weight":0.20},{"competencyId":"accountability","weight":0.20}]','["takes appropriate initiative","shares ownership","communicates priorities","considers the broader system","accepts responsibility"]','["dominates without listening","micromanages","takes others credit","avoids accountability","acts without consultation"]','[]'),
('motivation-values-fit','2026.08.1','motivation-values-fit','[{"competencyId":"motivation","weight":0.25},{"competencyId":"preparation","weight":0.20},{"competencyId":"career-alignment","weight":0.20},{"competencyId":"commitment-training","weight":0.20},{"competencyId":"clear-structured-communication","weight":0.15}]','["is specific","grounds motivation in experience","shows realistic understanding","connects opportunity to goals","commits to learning and contribution"]','["generic praise","prestige-driven reasoning","unrealistic expectations","denigrates other paths","claims to be overqualified"]','[]'),
('equity-cultural-humility','2026.08.1','equity-cultural-humility','[{"competencyId":"cultural-humility","weight":0.25},{"competencyId":"respectful-interpersonal-communication","weight":0.20},{"competencyId":"recognition-bias-inequity","weight":0.20},{"competencyId":"adaptability-communication","weight":0.20},{"competencyId":"advocacy","weight":0.15}]','["asks rather than assumes","recognizes limits of own perspective","uses interpreters appropriately","identifies systemic barriers","acts appropriately"]','["stereotyping","assumes culture determines preference","dismisses inequity","inappropriate paternalism"]','[]'),
('research-evidence','2026.08.1','research-evidence','[{"competencyId":"understanding-own-research","weight":0.25},{"competencyId":"evidence-based-reasoning","weight":0.25},{"competencyId":"intellectual-curiosity","weight":0.15},{"competencyId":"accountability","weight":0.20},{"competencyId":"patient-service-orientation","weight":0.15}]','["accurately explains question method role findings and limitations","does not exaggerate contribution","connects evidence to care","shows curiosity"]','["cannot explain own project","claims others work","publication-count boasting","overstates conclusions"]','[]'),
('program-fit','2026.08.1','motivation-values-fit','[{"competencyId":"program-understanding","weight":0.25},{"competencyId":"career-alignment","weight":0.30},{"competencyId":"preparation","weight":0.20},{"competencyId":"commitment-training","weight":0.15},{"competencyId":"clear-structured-communication","weight":0.10}]','["specific program knowledge","clear personal connection","credible contribution and learning goals"]','["answer could apply unchanged to any program"]','[]'),
('specialty-fit','2026.08.1','motivation-values-fit','[{"competencyId":"specialty-understanding","weight":0.25},{"competencyId":"motivation","weight":0.25},{"competencyId":"career-alignment","weight":0.20},{"competencyId":"commitment-training","weight":0.15},{"competencyId":"clear-structured-communication","weight":0.15}]','["experience-based motivation","realistic view of specialty","career connection"]','["generic motivation","unrealistic specialty expectations","denigrates other specialties"]','[]'),
('closing-questions','2026.08.1','communication-interpersonal','[{"competencyId":"insightful-questioning","weight":0.30},{"competencyId":"preparation","weight":0.25},{"competencyId":"intellectual-curiosity","weight":0.20},{"competencyId":"career-alignment","weight":0.15},{"competencyId":"respectful-interpersonal-communication","weight":0.10}]','["genuine curiosity","questions useful information not already available","program-aware follow-up"]','["no preparation","questions already answered clearly in available material"]','[]')
on conflict(id,version) do update set practice_area=excluded.practice_area,criteria=excluded.criteria,strong_signals=excluded.strong_signals,concerns=excluded.concerns,critical_elements=excluded.critical_elements;

insert into public.interview_rubrics(rubric_key,version,status,criteria,critical_elements,red_flags)
select family.id,family.version,'active',
  (select jsonb_agg(criterion || jsonb_build_object('anchors',definition.anchors) order by ordinal)
   from jsonb_array_elements(family.criteria) with ordinality as item(criterion,ordinal)
   join public.interview_competency_definitions definition on definition.id=criterion->>'competencyId'),
  family.critical_elements,family.concerns
from public.interview_rubric_families family
where family.version='2026.08.1'
on conflict(rubric_key,version) do update set status='active',criteria=excluded.criteria,critical_elements=excluded.critical_elements,red_flags=excluded.red_flags;

alter table public.interview_competency_definitions enable row level security;
alter table public.interview_rubric_families enable row level security;
alter table public.interview_question_rubric_mappings enable row level security;
alter table public.interview_processing_answers enable row level security;
create policy interview_competencies_read on public.interview_competency_definitions for select to authenticated using (true);
create policy interview_rubric_families_read on public.interview_rubric_families for select to authenticated using (true);
create policy interview_question_mappings_read on public.interview_question_rubric_mappings for select to authenticated using (true);
create policy interview_processing_owner_read on public.interview_processing_answers for select to authenticated using (user_id=auth.uid() or public.current_user_role()='admin');
grant select on public.interview_competency_definitions,public.interview_rubric_families,public.interview_question_rubric_mappings,public.interview_processing_answers to authenticated;

comment on table public.interview_processing_answers is 'Answer-level transcription/evaluation state. Ephemeral individual video bytes are never stored here.';
comment on column public.interview_processing_answers.transcript_words is 'Persisted Deepgram word timestamps used for deterministic delivery metrics and provider-independent evaluation.';

commit;
