begin;

update public.guidelines
set
  eyebrow = 'Professional guidance for building a defensible research profile',
  summary_points[1] = 'Use a proven three-part letter structure: background, new finding and creative local application.',
  preamble[2] = 'I advise new medical researchers to build their skills in a deliberate sequence: learn the language of publishing, read evidence critically, write a focused letter to the editor, progress through evidence synthesis and statistics, and contribute reliably to a real research team. The sections that follow give you the explanations, worked examples and professional cautions I would give a junior colleague beginning that journey.',
  sections = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    jsonb_set(
                      jsonb_set(
                        jsonb_set(
                          jsonb_set(
                            sections,
                            '{0,introduction}',
                            to_jsonb('Beyond passing examinations, residency programs want evidence of how you think, contribute and grow. Research can provide that evidence when your role is genuine and your understanding is deep.'::text)
                          ),
                          '{2,bullets,0}',
                          to_jsonb('The classic evidence pyramid, from lower to higher, is: expert opinion → case report → case-control study → cohort study → randomized controlled trial → systematic review → meta-analysis.'::text)
                        ),
                        '{3,introduction}',
                        to_jsonb('I often recommend journal correspondence as a first publishing exercise because it teaches the complete cycle in a disciplined short form: close reading, critical appraisal, argument, referencing, submission, editorial judgment and revision.'::text)
                      ),
                      '{3,bullets,5}',
                      to_jsonb('A useful beginner template is roughly 300–500 words, no more than three authors and about five references. Treat those numbers only as a planning guide; every journal sets its own limits and submission window.'::text)
                    ),
                    '{4,introduction}',
                    to_jsonb('Consider a worked letter about pioglitazone. It demonstrates the movement from clinical context to new evidence to local application, then raises the harder question every responsible author must ask: did I select only evidence that supports my warning?'::text)
                  ),
                  '{5,title}',
                  to_jsonb('Letter to the Editor Example'::text)
                ),
                '{5,introduction}',
                to_jsonb('I use the following complete teaching letter to show how a SIDS-related observation becomes a concise scholarly argument. Read it for structure and reasoning: it is a model to study, not text to submit as your own.'::text)
              ),
              '{9,introduction}',
              to_jsonb('Every new researcher should understand the publication pathway: conduct the research → write the findings → submit to a suitable journal → undergo editorial assessment and peer review → receive an accept, revise or reject decision. Each arrow contains real work.'::text)
            ),
            '{10,introduction}',
            to_jsonb('The following are established examples of fully or predominantly open-access journals. Access models and charges can change, so verify each journal’s current policy, scope, indexing and author instructions before submission.'::text)
          ),
          '{13,introduction}',
          to_jsonb('A research portfolio of roughly 10–15 publications may be substantial enough to justify exploring employment-based immigration options with a qualified attorney. Treat that number as a career-planning heuristic, never as a USCIS eligibility rule or promise.'::text)
        ),
        '{13,bullets,7}',
        to_jsonb('Practical guidance — A coherent body of approximately 10–15 legitimate publications, especially with first-author work, citations, peer review, presentations and field influence, may justify asking a qualified U.S. immigration attorney whether EB-1A or EB-2 NIW is realistic.'::text)
      ),
      '{13,bullets,9}',
      to_jsonb('Immigration pathways are separate from residency selection, visa sponsorship and physician-licensing requirements. Obtain legal advice for your individual facts rather than relying on colleagues, anecdotes or a publication-count calculator.'::text)
    ),
    '{5,bullets,5}',
    to_jsonb('Structure check—The first paragraph provides background; the second introduces the new finding; the third contributes the author’s creative local application. The final paragraph does not merely demand action: it identifies a knowledge gap and proposes locally generated research.'::text)
  )
where slug in (
  'research-projects-for-residency-step-2-2027',
  'research-projects-for-residency-step-3-2027',
  'research-projects-for-residency-2027'
)
and title = 'How to Begin Research That Can Get You Matched for Residency';

do $$
declare
  seeded_count integer;
  professional_eyebrow_count integer;
  section_title_count integer;
  prohibited_reference_count integer;
begin
  select
    count(*),
    count(*) filter (
      where eyebrow = 'Professional guidance for building a defensible research profile'
    ),
    count(*) filter (
      where sections->5->>'title' = 'Letter to the Editor Example'
    ),
    count(*) filter (
      where concat_ws(
        ' ',
        eyebrow,
        summary,
        array_to_string(summary_points, ' '),
        array_to_string(preamble, ' '),
        sections::text,
        array_to_string(conclusion, ' ')
      ) ~* '\m(the video|supplied pdf|supplied guide|masterclass|video-led|video-era)\M'
    )
  into seeded_count, professional_eyebrow_count, section_title_count, prohibited_reference_count
  from public.guidelines
  where slug in (
    'research-projects-for-residency-step-2-2027',
    'research-projects-for-residency-step-3-2027',
    'research-projects-for-residency-2027'
  );

  if seeded_count <> 3
    or professional_eyebrow_count <> 3
    or section_title_count <> 3
    or prohibited_reference_count <> 0
  then
    raise exception 'Research article voice update failed: rows %, eyebrow %, section title %, prohibited references %', seeded_count, professional_eyebrow_count, section_title_count, prohibited_reference_count;
  end if;
end;
$$;

commit;
