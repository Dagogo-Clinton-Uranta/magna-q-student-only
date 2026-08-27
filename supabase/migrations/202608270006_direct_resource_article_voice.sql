begin;

update public.resources
set
  summary_points = array[
    'See the approximately $6,235 unavoidable floor described for a first-attempt international applicant.',
    'Compare a realistic budget of about $10,815 with a difficult year reaching about $16,100.',
    'Understand which fees are fixed and which costs are most controllable.',
    'Model ERAS applications and NRMP ranks before non-refundable charges are incurred.',
    'Map major payments across the application calendar instead of treating them as one simultaneous bill.'
  ],
  preamble = array[
    'The financial route begins before examinations and continues through certification, applications, ranking, visa sponsorship, and the first day of residency. Because each organisation publishes only its own charges, an applicant’s first estimate can be wrong by several thousand dollars.',
    'Treat every figure as a planning estimate rather than a quotation. Fees can change without notice, almost every major charge is non-refundable, and each amount should be confirmed with the organisation collecting it before payment.'
  ],
  conclusion = array[
    'Treat the route as a timed financial plan rather than a single total. Secure the fixed entry costs, protect against retakes by testing when ready, research programme eligibility before paying, and reserve cash for the concentrated application and ranking periods.',
    'These figures are planning anchors, not guaranteed prices. Confirm every amount with ECFMG, USMLE/FSMB, OET, AAMC, ResidencyCAS, NRMP, or the organisation that will actually charge it.'
  ]
where slug = 'cost-of-the-usmle-route-to-match-2027';

do $$
declare
  rewritten text;
begin
  select sections::text
  into rewritten
  from public.resources
  where slug = 'cost-of-the-usmle-route-to-match-2027';

  rewritten := replace(
    rewritten,
    'The PDF builds the same route three ways so applicants can see how retakes, clinical experience, and application breadth change the total.',
    'Build the route three ways to see how retakes, clinical experience, and application breadth change the total.'
  );
  rewritten := replace(
    rewritten,
    'The document identifies retakes, United States clinical experience, and programme-list size as the three largest controllable costs.',
    'Retakes, United States clinical experience, and programme-list size are the three largest controllable costs.'
  );
  rewritten := replace(
    rewritten,
    'Research comes before spending because ERAS, NRMP, and Pathway charges described in the PDF are non-refundable.',
    'Research comes before spending because ERAS, NRMP, and Pathway charges are non-refundable.'
  );
  rewritten := replace(
    rewritten,
    'The PDF lists $110 for MyIntealth account establishment, including $50 for online notarisation of the identification form.',
    'Budget $110 for MyIntealth account establishment, including $50 for online notarisation of the identification form.'
  );
  rewritten := replace(
    rewritten,
    'After matching, the PDF lists $370 for J-1 visa sponsorship plus a separate $220 SEVIS fee.',
    'After matching, budget $370 for J-1 visa sponsorship plus a separate $220 SEVIS fee.'
  );
  rewritten := replace(
    rewritten,
    'The PDF specifically flags Step examination fees and surcharges for confirmation at usmle.org and usmle.fsmb.org before budgeting.',
    'Confirm Step examination fees and surcharges at usmle.org and usmle.fsmb.org before budgeting.'
  );
  rewritten := replace(
    rewritten,
    'The programme count resets for each specialty. The PDF gives $660 for thirty programmes in each of two specialties and $1,230 for sixty programmes in one specialty.',
    'The programme count resets for each specialty: thirty programmes in each of two specialties costs $660, while sixty programmes in one specialty costs $1,230.'
  );
  rewritten := replace(
    rewritten,
    'Each programme code beyond twenty costs $30. The PDF’s example of thirty-five ranked programmes adds $450 at certification.',
    'Each programme code beyond twenty costs $30, so ranking thirty-five programmes adds $450 at certification.'
  );
  rewritten := replace(
    rewritten,
    'Ranking broadly can remain the right decision, but the PDF says the necessary money should be available before the 3 March 2027 certification point.',
    'Ranking broadly can remain the right decision, but the necessary money should be available before the 3 March 2027 certification point.'
  );
  rewritten := replace(
    rewritten,
    'The PDF estimates roughly $2,900 as fixed entry costs and then ranks the decisions that can materially change the total.',
    'Roughly $2,900 consists of fixed entry costs; the remaining total depends on decisions that can materially change spending.'
  );
  rewritten := replace(
    rewritten,
    'Retakes have the greatest impact: the PDF says an internationally delivered Step retake adds $930 and an OET retake adds $385.',
    'Retakes have the greatest impact: an internationally delivered Step retake adds $930 and an OET retake adds $385.'
  );
  rewritten := replace(
    rewritten,
    'The PDF describes applications to programmes that do not accept international applicants, sponsor the needed visa, or fit a graduation-year limit as spending with a known return of zero.',
    'Applying to programmes that do not accept international applicants, sponsor the needed visa, or fit your graduation year is spending with a known return of zero.'
  );
  rewritten := replace(
    rewritten,
    'The document does not argue for the lowest possible spending; it identifies two areas it says consistently repay themselves.',
    'Good financial planning is not simply about spending as little as possible. Two investments can consistently justify their cost.'
  );
  rewritten := replace(
    rewritten,
    'The PDF warns applicants to question services that promise outcomes because no organisation can guarantee a Match.',
    'Question any service that promises an outcome because no organisation can guarantee a Match.'
  );
  rewritten := replace(
    rewritten,
    'The PDF identifies the September application block, at roughly $1,500 to $2,000 in one month, as the point when many applicants are caught short.',
    'The September application block can require roughly $1,500 to $2,000 in one month and is the point when many applicants are caught short.'
  );
  rewritten := replace(
    rewritten,
    'ECFMG fees in the document were taken from the ECFMG Fees Overview page on 18 August 2026; AAMC rates came from the 2027 ERAS fee page and NRMP charges from the Match Fees page.',
    'ECFMG fees were verified against the ECFMG Fees Overview page on 18 August 2026; AAMC rates came from the 2027 ERAS fee page and NRMP charges from the Match Fees page.'
  );
  rewritten := replace(
    rewritten,
    'Step examination fees, OET pricing, and ResidencyCAS tiers were corroborated across independent 2026 sources but were not confirmed on the issuing organisations’ pages in the same session and are flagged in the PDF.',
    'Step examination fees, OET pricing, and ResidencyCAS tiers were corroborated across independent 2026 sources but were not confirmed on the issuing organisations’ pages in the same verification session.'
  );
  rewritten := replace(
    rewritten,
    'The edition schedules fee re-verification for 1 January 2027 because fees can change without notice and many organisations revise them in January.',
    'Re-verify every fee on 1 January 2027 because charges can change without notice and many organisations revise them in January.'
  );

  update public.resources
  set sections = rewritten::jsonb
  where slug = 'cost-of-the-usmle-route-to-match-2027';
end;
$$;

update public.resources
set preamble = array[
  'Step 1 has been reported only as pass or fail for examinations taken on or after 26 January 2022. That changed the purpose of practice exams: the useful question is no longer “what will I score?” but “what is the probability I pass?”',
  'Use official NBME self-assessments as readiness measurements. For international medical graduates in particular, separate published NBME reporting from the personal judgment required to decide what safety margin should trigger an exam booking.'
]
where slug = 'how-to-use-nbme-exams-for-usmle-step-1';

do $$
declare
  rewritten text;
begin
  select sections::text
  into rewritten
  from public.resources
  where slug = 'how-to-use-nbme-exams-for-usmle-step-1';

  rewritten := replace(
    rewritten,
    'The PDF’s central strategy is to clear Step 1 confidently once, then stop rather than continuing to chase a number that no longer exists.',
    'Clear Step 1 confidently once, then stop rather than continuing to chase a number that no longer exists.'
  );
  rewritten := replace(
    rewritten,
    'The Comprehensive Basic Science Exam, or CBSE, is administered by some medical schools and reports in the same way. The PDF says to treat that result like a CBSSA result.',
    'The Comprehensive Basic Science Exam, or CBSE, is administered by some medical schools and reports in the same way. Treat that result like a CBSSA result.'
  );
  rewritten := replace(
    rewritten,
    'The PDF notes that late-day concentration failures can matter even when knowledge is adequate.',
    'Late-day concentration failures can matter even when knowledge is adequate.'
  );
  rewritten := replace(
    rewritten,
    'The PDF calls the assessment the cheap part and the review the place where improvement happens.',
    'Taking the assessment is the easy part; careful review is where improvement happens.'
  );
  rewritten := replace(
    rewritten,
    'The PDF advises going narrower rather than wider after a weak result and warns against adding a third resource late in preparation.',
    'Go narrower rather than wider after a weak result, and avoid adding a third resource late in preparation.'
  );
  rewritten := replace(
    rewritten,
    'The probability of passing on the report is the readiness figure the PDF says matters because it is based on real examinee data.',
    'The probability of passing on the report is the most useful readiness figure because it is based on real examinee data.'
  );
  rewritten := replace(
    rewritten,
    'The PDF recommends a comfortable margin on a recent form, ideally confirmed twice, because the downside of failure is permanent while the upside of a higher practice result is capped.',
    'Aim for a comfortable margin on a recent form, ideally confirmed twice, because the downside of failure is permanent while the upside of a higher practice result is capped.'
  );
  rewritten := replace(
    rewritten,
    'The PDF identifies registration, certification status, budgeting, language-related pacing, and score priorities that are particularly relevant to international graduates.',
    'International graduates should pay particular attention to registration, certification status, budgeting, language-related pacing, and score priorities.'
  );
  rewritten := replace(
    rewritten,
    'Programmes see pass or fail for Step 1, so the PDF advises getting safely through Step 1 and directing score-maximising effort toward Step 2 CK.',
    'Programmes see pass or fail for Step 1, so get safely through Step 1 and direct score-maximising effort toward Step 2 CK.'
  );
  rewritten := replace(
    rewritten,
    'The recurring mistakes in the PDF all weaken the reliability of the readiness decision or waste limited preparation time.',
    'These recurring mistakes weaken the reliability of the readiness decision or waste limited preparation time.'
  );
  rewritten := replace(
    rewritten,
    'The PDF suggests at least three or four forms to establish a trend; one result is not a trend and two barely establish one.',
    'Take at least three or four forms to establish a trend; one result is not a trend and two barely establish one.'
  );

  update public.resources
  set sections = rewritten::jsonb
  where slug = 'how-to-use-nbme-exams-for-usmle-step-1';
end;
$$;

do $$
declare
  indirect_count integer;
begin
  select count(*)
  into indirect_count
  from public.resources
  where slug in (
    'cost-of-the-usmle-route-to-match-2027',
    'how-to-use-nbme-exams-for-usmle-step-1'
  )
    and lower(
      array_to_string(summary_points, ' ') || ' ' ||
      array_to_string(preamble, ' ') || ' ' ||
      sections::text || ' ' ||
      array_to_string(conclusion, ' ')
    ) ~ '(the pdf|the document|this resource follows|the edition)';

  if indirect_count <> 0 then
    raise exception 'Expected direct expert voice in both USMLE outline resources; found % indirect records', indirect_count;
  end if;
end;
$$;

commit;
