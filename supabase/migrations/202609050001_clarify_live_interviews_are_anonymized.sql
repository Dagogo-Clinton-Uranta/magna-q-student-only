begin;

-- The interviews and experiences are real. Names are pseudonyms and selected
-- identifying details are generalized solely to protect participant anonymity.

update public.resources
set
  preamble = array[
    $preamble$Meet Katie, a Psychiatry residency applicant whose real interview experiences inform this Magna-Q analysis. Her answers cover thirteen common questions, including specialty motivation, program fit, strengths, weaknesses, patient care, conflict, adversity, integrity, and ethics.$preamble$,
    $preamble$Our editorial analysis shows what each response communicates, where it could be safer or more precise, and how students can adapt the underlying structure to their own truthful experiences. Katie is a pseudonym, and nonessential personal details have been generalized to protect the interview participant’s anonymity.$preamble$
  ],
  source_document_name = 'Magna-Q original learning resource — anonymized interview participant Katie',
  updated_at = now()
where slug = 'psychiatry-residency-mock-interview-answer-analysis';

update public.resources
set
  summary = 'Study Maya’s anonymized Internal Medicine interview and learn how focused answers can communicate clinical readiness, program fit, teamwork, research experience, and professional identity.',
  preamble = array[
    $preamble$Meet Maya, an international medical graduate whose real interview experiences inform this Magna-Q Internal Medicine analysis. Her answers demonstrate how training across several healthcare systems can support discussions about adaptability, clinical readiness, teaching, research, and possible fellowship interests.$preamble$,
    $preamble$Our editorial analysis explains what a residency interviewer could learn from each answer and converts the lesson into a reusable framework. Maya is a pseudonym, and locations, institutions, and nonessential biographical details have been generalized to protect the interview participant’s anonymity.$preamble$
  ],
  source_document_name = 'Magna-Q original learning resource — anonymized interview participant Maya',
  updated_at = now()
where slug = 'internal-medicine-residency-mock-interview-analysis';

update public.resources
set
  summary = 'Study Priya’s anonymized Internal Medicine interview answers, then compare what each first response communicates with a clearer evidence-based structure and safer professional framing.',
  preamble = array[
    $preamble$Meet Priya, a recent medical graduate whose real interview experiences inform this Magna-Q Internal Medicine analysis. Her answers draw on internship during the COVID-19 era, U.S. clinical experience, research, adversity, and patient communication.$preamble$,
    $preamble$We present each first response as a learning opportunity, then explain what works, what remains unclear, and how to rebuild the answer with stronger evidence and reflection. Priya is a pseudonym, and locations, institutions, and nonessential personal details have been generalized to protect the interview participant’s anonymity.$preamble$
  ],
  sections = replace(
    sections::text,
    'For this teaching case, Priya’s initial strength response is intentionally abbreviated so the analysis can focus on the evaluation standard.',
    'Priya’s initial strength response is abbreviated here so the analysis can focus on the evaluation standard.'
  )::jsonb,
  source_document_name = 'Magna-Q original learning resource — anonymized interview participant Priya',
  updated_at = now()
where slug = 'internal-medicine-coached-mock-interview-analysis';

update public.resources
set
  summary = 'Study Jamil’s anonymized Internal Medicine interview and see how strong clinical experiences can be rebuilt into concise answers that make responsibility, judgment, and fit easy to recognize.',
  preamble = array[
    $preamble$Meet Jamil, an international medical graduate whose real interview experiences inform this Magna-Q Internal Medicine analysis. His background includes prior Internal Medicine residency experience outside the United States, U.S. clinical experience, cancer-center volunteering, research, tutoring, fencing, and chess.$preamble$,
    $preamble$Jamil has strong material but initially gives long, branching answers. Our analysis shows students how to identify the central message, select the strongest evidence, anticipate what an interviewer may infer, and build a tighter answer without losing personality.$preamble$,
    $preamble$This analysis focuses on the questions and answer patterns that offer the greatest learning value. Jamil is a pseudonym, and locations, institutions, and nonessential biographical details have been generalized to protect the interview participant’s anonymity.$preamble$
  ],
  sections = replace(
    replace(
      sections::text,
      'This teaching case summarizes the answer to emphasize the difference between evaluating programs and explaining personal fit.',
      'This analysis summarizes the answer to emphasize the difference between evaluating programs and explaining personal fit.'
    ),
    'This teaching case summarizes Jamil’s weakness response so the analysis can focus on selecting a credible limitation and demonstrating improvement.',
    'This analysis summarizes Jamil’s weakness response so the discussion can focus on selecting a credible limitation and demonstrating improvement.'
  )::jsonb,
  source_document_name = 'Magna-Q original learning resource — anonymized interview participant Jamil',
  updated_at = now()
where slug = 'internal-medicine-high-yield-live-interview-analysis';

update public.resources
set
  summary = 'Analyze Suraj’s anonymized Internal Medicine interview answers about international training, U.S. rotations, COVID care, mistakes, strengths, weaknesses, long-term goals, and program fit.',
  preamble = array[
    $preamble$Meet Suraj, an international medical graduate whose real interview experiences inform this Magna-Q Internal Medicine analysis. His background includes growing up in a rural community, moving to a large city for medical school, completing internship and Internal Medicine residency training, and undertaking several U.S. clinical rotations.$preamble$,
    $preamble$Suraj frequently supports a quality with an example instead of relying only on adjectives. Our analysis helps students make each example answer the exact question, clarify personal action and results, demonstrate accountability, and connect program claims to verified details.$preamble$,
    $preamble$Suraj is a pseudonym, and locations, institutions, and nonessential personal details have been generalized to protect the interview participant’s anonymity. The interview experiences are real; students should use only their own truthful experiences and accurately describe their role and outcomes.$preamble$
  ],
  source_document_name = 'Magna-Q original learning resource — anonymized interview participant Suraj',
  updated_at = now()
where slug = 'internal-medicine-evidence-based-live-interview-analysis';

do $$
declare
  interview_count integer;
  misleading_count integer;
begin
  select count(*)
  into interview_count
  from public.resources
  where classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published;

  select count(*)
  into misleading_count
  from public.resources
  where classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published
    and lower(concat_ws(
      ' ',
      coalesce(title, ''),
      coalesce(summary, ''),
      coalesce(array_to_string(preamble, ' '), ''),
      coalesce(sections::text, ''),
      coalesce(array_to_string(conclusion, ' '), ''),
      coalesce(source_document_name, '')
    )) ~ '(fiction|fabricat|invented|imaginary|teaching case|educational sample)';

  if interview_count <> 5 or misleading_count <> 0 then
    raise exception
      'Expected five published, anonymized live interview resources with no language implying invented experiences; found % resources and % misleading records',
      interview_count,
      misleading_count;
  end if;
end;
$$;

commit;
