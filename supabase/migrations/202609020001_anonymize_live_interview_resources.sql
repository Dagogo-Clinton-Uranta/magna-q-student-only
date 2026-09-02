begin;

-- These resources are presented as Magna-Q teaching cases. The learner names are
-- fictional, nonessential identifying details are generalized, and external-source
-- provenance is intentionally removed from the student-facing records.

update public.resources
set
  preamble = array[
    $preamble$Meet Katie, a fictional Psychiatry residency applicant in this Magna-Q sample interview. Her answers cover thirteen common questions, including specialty motivation, program fit, strengths, weaknesses, patient care, conflict, adversity, integrity, and ethics.$preamble$,
    $preamble$Our editorial analysis shows what each response communicates, where it could be safer or more precise, and how students can adapt the underlying structure to their own truthful experiences. Katie’s name and nonessential personal details are fictionalized for this learning piece.$preamble$
  ],
  sections = replace(
    replace(sections::text, 'Candidate’s answer', 'Katie’s sample answer'),
    'this candidate’s',
    'Katie’s'
  )::jsonb,
  source_links = '[]'::jsonb,
  source_document_name = 'Magna-Q original learning resource — fictional learner Katie',
  document_s3_url = null,
  updated_at = now()
where slug = 'psychiatry-residency-mock-interview-answer-analysis';

update public.resources
set
  summary = 'Study Maya’s fictionalized Internal Medicine sample interview and learn how focused answers can communicate clinical readiness, program fit, teamwork, research experience, and professional identity.',
  preamble = array[
    $preamble$Meet Maya, a fictional international medical graduate in this Magna-Q Internal Medicine sample interview. Her case is designed to demonstrate how training across several healthcare systems can support answers about adaptability, clinical readiness, teaching, research, and possible fellowship interests.$preamble$,
    $preamble$Our editorial analysis explains what a residency interviewer could learn from each answer and converts the lesson into a reusable framework. Maya’s name, locations, institutions, and nonessential biographical details are fictionalized or generalized so students can focus on answer quality rather than a real person.$preamble$
  ],
  sections = replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(sections::text, 'Candidate’s answer', 'Maya’s sample answer'),
              'New Jersey',
              'the United States'
            ),
            'Jordan',
            'another country'
          ),
          'Imperial College in London',
          'a medical school in the United Kingdom'
        ),
        'the United States, another country, and the United Kingdom',
        'three different countries'
      ),
      'The transcript’s coaching',
      'The Magna-Q framework'
    ),
    'this candidate’s',
    'Maya’s'
  )::jsonb,
  source_links = '[]'::jsonb,
  source_document_name = 'Magna-Q original learning resource — fictional learner Maya',
  document_s3_url = null,
  updated_at = now()
where slug = 'internal-medicine-residency-mock-interview-analysis';

update public.resources
set
  title = 'Internal Medicine Sample Interview: Before-and-After Answer Analysis',
  summary = 'Study Priya’s fictionalized Internal Medicine answers, then compare what each first response communicates with a clearer evidence-based structure and safer professional framing.',
  preamble = array[
    $preamble$Meet Priya, a fictional recent medical graduate in this Magna-Q Internal Medicine teaching case. Her sample answers draw on internship during the COVID-19 era, U.S. clinical experience, research, adversity, and patient communication.$preamble$,
    $preamble$We present each first response as a learning opportunity, then explain what works, what remains unclear, and how to rebuild the answer with stronger evidence and reflection. Priya’s name, locations, institutions, and nonessential personal details are fictionalized or generalized.$preamble$
  ],
  sections = replace(
    replace(
      replace(
        replace(
          replace(
            replace(sections::text, 'Candidate’s answer', 'Priya’s sample answer'),
            'Vadodara',
            'her hometown'
          ),
          'San Antonio',
          'the United States'
        ),
        'The transcript’s original strength response is not fully preserved, but the coaching makes the evaluation standard clear.',
        'For this teaching case, Priya’s initial strength response is intentionally abbreviated so the analysis can focus on the evaluation standard.'
      ),
      'The coaching identifies',
      'Our analysis identifies'
    ),
    'the candidate’s',
    'Priya’s'
  )::jsonb,
  conclusion = array[
    $conclusion$Priya’s first answers are useful because their weaknesses are common: an opening that is personal but not professionally informative, specialty reasons without examples, program praise without specificity, a broad weakness without an improvement process, and a behavioral story in which the learner’s action is unclear.$conclusion$,
    $conclusion$The repair is consistent across questions. Decide what the interviewer should learn, select a truthful experience that proves it, make your action visible, and end with relevance or reflection. International graduates should explain unfamiliar training and responsibility rather than assuming an institution’s name speaks for itself.$conclusion$,
    $conclusion$Good interview preparation should help the answer become more authentically yours. It should not supply accomplishments you did not have, hide appropriate uncertainty, or turn every sentence into sales language. Clear evidence, honest limits, patient-centered judgment, and natural conversation are stronger than a rehearsed performance.$conclusion$
  ],
  source_links = '[]'::jsonb,
  source_document_name = 'Magna-Q original learning resource — fictional learner Priya',
  document_s3_url = null,
  updated_at = now()
where slug = 'internal-medicine-coached-mock-interview-analysis';

update public.resources
set
  summary = 'Study Jamil’s fictionalized Internal Medicine sample interview and see how strong clinical experiences can be rebuilt into concise answers that make responsibility, judgment, and fit easy to recognize.',
  preamble = array[
    $preamble$Meet Jamil, a fictional international medical graduate in this Magna-Q Internal Medicine teaching case. His sample profile includes prior Internal Medicine residency experience outside the United States, U.S. clinical experience, cancer-center volunteering, research, tutoring, fencing, and chess.$preamble$,
    $preamble$Jamil has strong material but initially gives long, branching answers. Our analysis shows students how to identify the central message, select the strongest evidence, anticipate what an interviewer may infer, and build a tighter answer without losing personality.$preamble$,
    $preamble$This teaching case focuses on the questions and answer patterns that offer the greatest learning value. Jamil’s name, locations, institutions, and nonessential biographical details are fictionalized or generalized for education.$preamble$
  ],
  sections = replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(sections::text, 'Candidate’s answer', 'Jamil’s sample answer'),
                'Candidate’s preserved answer',
                'Jamil’s sample answer'
              ),
              'Alexandria Faculty of Medicine in Egypt',
              'medical school and prior residency outside the United States'
            ),
            'Egyptian background',
            'international background'
          ),
          'in Egypt',
          'in his home country'
        ),
        'training in Egypt',
        'international training'
      ),
      'Part of this answer is missing from the transcript, but the preserved material shows the difference between evaluating programs and explaining personal fit.',
      'This teaching case summarizes the answer to emphasize the difference between evaluating programs and explaining personal fit.'
    ),
    'The original weakness exchange is absent from the supplied transcript, so only the coach’s preserved summary can be analyzed.',
    'This teaching case summarizes Jamil’s weakness response so the analysis can focus on selecting a credible limitation and demonstrating improvement.'
  )::jsonb,
  source_links = '[]'::jsonb,
  source_document_name = 'Magna-Q original learning resource — fictional learner Jamil',
  document_s3_url = null,
  updated_at = now()
where slug = 'internal-medicine-high-yield-live-interview-analysis';

update public.resources
set
  summary = 'Analyze Suraj’s fictionalized Internal Medicine sample answers about international training, U.S. rotations, COVID care, mistakes, strengths, weaknesses, long-term goals, and program fit.',
  preamble = array[
    $preamble$Meet Suraj, a fictional international medical graduate in this Magna-Q Internal Medicine teaching case. His sample profile includes growing up in a rural community, moving to a large city for medical school, completing internship and Internal Medicine residency training, and undertaking several U.S. clinical rotations.$preamble$,
    $preamble$Suraj frequently supports a quality with an example instead of relying only on adjectives. Our analysis helps students make each example answer the exact question, clarify personal action and results, demonstrate accountability, and connect program claims to verified details.$preamble$,
    $preamble$Suraj’s name, locations, institutions, and nonessential personal details are fictionalized or generalized. The clinical scenarios are presented as educational samples; students should use only their own truthful experiences and accurately describe their role and outcomes.$preamble$
  ],
  sections = replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(sections::text, 'Candidate’s answer', 'Suraj’s sample answer'),
                    'Candidate’s answers',
                    'Suraj’s sample answers'
                  ),
                  'Dow Medical College',
                  'medical school in his home country'
                ),
                'Karachi',
                'a large city'
              ),
              'Chicago',
              'the United States'
            ),
            'Swedish Covenant Hospital',
            'a U.S. hospital'
          ),
          'COVID care in Pakistan',
          'COVID care in his home country'
        ),
        'give back to Pakistan',
        'give back to his home country'
      ),
      'service in Pakistan',
      'service in his home country'
    ),
    'Dr. Sanjay Kumar',
    'Suraj'
  )::jsonb,
  source_links = '[]'::jsonb,
  source_document_name = 'Magna-Q original learning resource — fictional learner Suraj',
  document_s3_url = null,
  updated_at = now()
where slug = 'internal-medicine-evidence-based-live-interview-analysis';

do $$
declare
  sanitized_count integer;
  exposed_count integer;
begin
  select count(*)
  into sanitized_count
  from public.resources
  where classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published
    and source_document_name like 'Magna-Q original learning resource — fictional learner %'
    and source_links = '[]'::jsonb;

  select count(*)
  into exposed_count
  from public.resources
  where classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published
    and (
      lower(coalesce(array_to_string(preamble, ' '), '')) ~ '(transcript|recording|user-supplied|arafa|sanjay kumar)'
      or lower(coalesce(sections::text, '')) ~ '(transcript|recording|user-supplied|arafa|sanjay kumar|dow medical|alexandria faculty|vadodara|san antonio|swedish covenant)'
      or lower(coalesce(source_document_name, '')) ~ '(transcript|recording|user-supplied|arafa|sanjay kumar)'
      or jsonb_array_length(source_links) <> 0
    );

  if sanitized_count <> 5 or exposed_count <> 0 then
    raise exception
      'Expected five anonymized Magna-Q interview resources and no exposed source/name markers; found % sanitized and % exposed',
      sanitized_count,
      exposed_count;
  end if;
end;
$$;

commit;
