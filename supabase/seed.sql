insert into public.exams (id, code, name, description, sort_order) values
('10000000-0000-0000-0000-000000000001','step1','USMLE Step 1','Foundational sciences in clinical context',1),
('10000000-0000-0000-0000-000000000002','step2ck','USMLE Step 2 CK','Clinical knowledge and patient care',2),
('10000000-0000-0000-0000-000000000003','step3','USMLE Step 3','Independent medical practice',3)
on conflict (code) do update set name = excluded.name, description = excluded.description;

do $$
declare exam record; subject_name text; category_name text; v_subject_id uuid; v_category_id uuid;
begin
  for exam in select id from public.exams loop
    foreach subject_name in array array['Medicine','Surgery','Psychiatry','Paediatrics','Obstetrics and Gynaecology'] loop
      insert into public.subjects (exam_id, slug, name, sort_order)
      values (exam.id, lower(regexp_replace(subject_name, '[^a-zA-Z0-9]+', '-', 'g')), subject_name,
        array_position(array['Medicine','Surgery','Psychiatry','Paediatrics','Obstetrics and Gynaecology'], subject_name))
      on conflict (exam_id, slug) do update set name = excluded.name returning id into v_subject_id;
      foreach category_name in array array['Allergy and Immunology','Cardiovascular','Respiratory','Renal and Urinary','Gastrointestinal','Nervous System','Musculoskeletal','Endocrine','Male Reproductive','Female Reproductive','Pregnancy and Childbirth','Blood and Lymphoreticular','Behavioural Health','Multisystem Processes'] loop
        insert into public.categories (exam_id, slug, name, sort_order)
        values (exam.id, lower(regexp_replace(category_name, '[^a-zA-Z0-9]+', '-', 'g')), category_name,
          array_position(array['Allergy and Immunology','Cardiovascular','Respiratory','Renal and Urinary','Gastrointestinal','Nervous System','Musculoskeletal','Endocrine','Male Reproductive','Female Reproductive','Pregnancy and Childbirth','Blood and Lymphoreticular','Behavioural Health','Multisystem Processes'], category_name))
        on conflict (exam_id, slug) do update set name = excluded.name returning id into v_category_id;
        if subject_name = 'Medicine' or
           (subject_name = 'Surgery' and category_name in ('Cardiovascular','Respiratory','Gastrointestinal','Musculoskeletal','Nervous System')) or
           (subject_name = 'Psychiatry' and category_name in ('Behavioural Health','Nervous System')) or
           (subject_name = 'Paediatrics' and category_name in ('Allergy and Immunology','Respiratory','Cardiovascular','Gastrointestinal','Nervous System','Multisystem Processes')) or
           (subject_name = 'Obstetrics and Gynaecology' and category_name in ('Female Reproductive','Pregnancy and Childbirth','Endocrine')) then
          insert into public.subject_categories(subject_id, category_id) values(v_subject_id, v_category_id) on conflict do nothing;
        end if;
      end loop;
    end loop;
  end loop;
end $$;

-- The forward migration updates existing environments. A fresh database has
-- no taxonomy until this seed runs, so apply the same current system catalog.
update public.subjects set name = 'Pediatrics' where slug = 'paediatrics';
update public.subjects set name = 'Obstetrics and Gynecology'
where slug = 'obstetrics-and-gynaecology';
update public.categories set active = false;

do $$
declare exam record; item record;
begin
  for exam in select id from public.exams loop
    for item in select * from (values
      ('allergy-and-immunology', 'Allergy and Immunology', 1),
      ('biostatistics-and-epidemiology', 'Biostatistics and Epidemiology', 2),
      ('cardiovascular', 'Cardiovascular System', 3),
      ('dermatology', 'Dermatology', 4),
      ('ear-nose-and-throat', 'Ear, Nose & Throat (ENT)', 5),
      ('endocrine', 'Endocrine, Diabetes & Metabolism', 6),
      ('female-reproductive', 'Female Reproductive System & Breast', 7),
      ('gastrointestinal', 'Gastrointestinal & Nutrition', 8),
      ('general-principles', 'General Principles', 9),
      ('hematology-and-oncology', 'Hematology & Oncology', 10),
      ('infectious-diseases', 'Infectious Diseases', 11),
      ('male-reproductive', 'Male Reproductive System', 12),
      ('nervous-system', 'Nervous System', 13),
      ('ophthalmology', 'Ophthalmology', 14),
      ('poisoning-and-environmental', 'Poisoning & Environmental', 15),
      ('pregnancy-and-childbirth', 'Pregnancy, Childbirth & Puerperium', 16),
      ('psychiatric-behavioral-and-substance-use', 'Psychiatric/Behavioral & Substance Use Disorders', 17),
      ('pulmonary-and-critical-care', 'Pulmonary & Critical Care', 18),
      ('renal-and-urinary', 'Renal, Urinary Systems & Electrolytes', 19),
      ('rheumatology-orthopedics-and-sports', 'Rheumatology/Orthopedics & Sports', 20),
      ('social-sciences', 'Social Sciences (Ethics/Legal/Professional)', 21)
    ) as systems(slug, name, sort_order) loop
      insert into public.categories(exam_id, slug, name, sort_order, active)
      values(exam.id, item.slug, item.name, item.sort_order, true)
      on conflict (exam_id, slug) do update set
        name = excluded.name, sort_order = excluded.sort_order, active = true;
    end loop;
  end loop;
end $$;

insert into public.subject_categories(subject_id, category_id)
select s.id, c.id
from public.subjects s
join public.categories c on c.exam_id = s.exam_id and c.active
where
  s.slug = 'medicine'
  or (s.slug = 'surgery' and c.slug in (
    'cardiovascular', 'dermatology', 'ear-nose-and-throat',
    'female-reproductive', 'gastrointestinal', 'general-principles',
    'hematology-and-oncology', 'male-reproductive', 'nervous-system',
    'ophthalmology', 'pulmonary-and-critical-care', 'renal-and-urinary',
    'rheumatology-orthopedics-and-sports'
  ))
  or (s.slug = 'psychiatry' and c.slug in (
    'nervous-system', 'poisoning-and-environmental',
    'psychiatric-behavioral-and-substance-use', 'social-sciences'
  ))
  or (s.slug = 'paediatrics' and c.slug in (
    'allergy-and-immunology', 'cardiovascular', 'dermatology',
    'ear-nose-and-throat', 'endocrine', 'gastrointestinal',
    'general-principles', 'hematology-and-oncology', 'infectious-diseases',
    'nervous-system', 'ophthalmology', 'poisoning-and-environmental',
    'pulmonary-and-critical-care', 'renal-and-urinary',
    'rheumatology-orthopedics-and-sports', 'social-sciences'
  ))
  or (s.slug = 'obstetrics-and-gynaecology' and c.slug in (
    'endocrine', 'female-reproductive', 'general-principles',
    'hematology-and-oncology', 'infectious-diseases',
    'pregnancy-and-childbirth', 'social-sciences'
  ))
on conflict do nothing;

-- Practice content for exercising the complete student test-builder flow.
-- This block is idempotent for first-time linked-project seeding.
-- The same 30 clinically varied samples are provided for each supported exam
-- so every student's target exam has a useful initial pool.
begin;

create temporary table sample_question_templates (
  template_id integer primary key,
  system_slug text not null,
  subject_slugs text[] not null,
  stem text not null,
  correct_answer text not null,
  distractor_one text not null,
  distractor_two text not null,
  distractor_three text not null,
  explanation text not null
);

insert into sample_question_templates values
(1, 'allergy-and-immunology', array['medicine','paediatrics'],
 'A child develops wheeze, urticaria, and hypotension minutes after eating groundnuts. Which treatment should be given first?',
 'Intramuscular epinephrine', 'Intravenous hydrocortisone', 'Oral cetirizine', 'Nebulized salbutamol alone',
 'Intramuscular epinephrine is the first-line treatment for anaphylaxis because it rapidly treats airway edema and shock.'),
(2, 'biostatistics-and-epidemiology', array['medicine'],
 'A screening test detects 90 of 100 people who truly have a disease. What is the sensitivity of the test?',
 '90%', '10%', '50%', '100%',
 'Sensitivity is the proportion of people with disease who have a positive test: 90 divided by 100 equals 90%.'),
(3, 'cardiovascular', array['medicine'],
 'A patient has crushing central chest pain and ST elevation in contiguous leads. What is the most urgent management priority?',
 'Immediate reperfusion assessment', 'Routine outpatient echocardiography', 'A seven-day antibiotic course', 'Reassurance and discharge',
 'An acute ST-elevation myocardial infarction requires urgent reperfusion assessment while standard emergency treatment is initiated.'),
(4, 'cardiovascular', array['medicine','surgery'],
 'A patient has tearing chest pain radiating to the back with unequal arm blood pressures. Which diagnosis is most likely?',
 'Acute aortic dissection', 'Stable angina', 'Acute pericarditis', 'Costochondritis',
 'Abrupt tearing pain, radiation to the back, and a pulse or blood-pressure differential are classic clues to aortic dissection.'),
(5, 'dermatology', array['medicine','paediatrics'],
 'A child has intensely itchy flexural eczema with a chronic relapsing course. Which daily intervention best supports the skin barrier?',
 'Regular liberal emollient use', 'Daily systemic antibiotics', 'Avoiding all bathing', 'Long-term oral corticosteroids',
 'Regular emollients reduce water loss and restore the epidermal barrier in atopic dermatitis.'),
(6, 'ear-nose-and-throat', array['medicine','surgery','paediatrics'],
 'A febrile child has ear pain and a bulging, opaque tympanic membrane. Which diagnosis best fits these findings?',
 'Acute otitis media', 'Otitis externa', 'Otosclerosis', 'Ménière disease',
 'A bulging tympanic membrane in a child with acute pain and fever is characteristic of acute otitis media.'),
(7, 'endocrine', array['medicine','paediatrics'],
 'A patient with type 1 diabetes has abdominal pain, deep breathing, ketones, and high anion-gap acidosis. What is the diagnosis?',
 'Diabetic ketoacidosis', 'Hyperosmolar hyperglycemic state', 'Lactic acidosis from metformin only', 'Respiratory alkalosis',
 'Ketosis and high anion-gap metabolic acidosis in type 1 diabetes indicate diabetic ketoacidosis.'),
(8, 'endocrine', array['medicine','obstetrics-and-gynaecology'],
 'A pregnant patient has an abnormal oral glucose tolerance test at 28 weeks. Which condition has been identified?',
 'Gestational diabetes mellitus', 'Diabetes insipidus', 'Primary adrenal insufficiency', 'Postpartum thyroiditis',
 'Glucose intolerance first recognized during pregnancy is classified as gestational diabetes mellitus.'),
(9, 'female-reproductive', array['obstetrics-and-gynaecology','surgery'],
 'A patient reports a painless breast lump. Which next step is most appropriate for definitive assessment?',
 'Clinical assessment with age-appropriate imaging and tissue sampling when indicated', 'Empiric antibiotics without examination', 'Reassurance without follow-up', 'Immediate chemotherapy without diagnosis',
 'A breast lump requires structured triple assessment: clinical evaluation, appropriate imaging, and pathological sampling when indicated.'),
(10, 'gastrointestinal', array['medicine','surgery'],
 'A patient has fever, right upper-quadrant pain, and a positive Murphy sign. Which diagnosis is most likely?',
 'Acute cholecystitis', 'Acute appendicitis', 'Pancreatic cancer', 'Ulcerative colitis',
 'Right upper-quadrant pain, fever, and an inspiratory arrest on palpation support acute cholecystitis.'),
(11, 'gastrointestinal', array['medicine','paediatrics'],
 'A child has chronic diarrhea, abdominal distension, poor growth, and iron deficiency. Which initial serologic test is commonly used for coeliac disease?',
 'IgA tissue transglutaminase with total IgA', 'Serum troponin', 'Antinuclear antibody only', 'Plasma metanephrines',
 'IgA tissue transglutaminase with a total IgA level is a standard initial serologic approach when coeliac disease is suspected.'),
(12, 'general-principles', array['medicine'],
 'Which cellular process produces two genetically identical daughter cells for growth and tissue repair?',
 'Mitosis', 'Meiosis I', 'Fertilization', 'Transcription',
 'Mitosis distributes duplicated chromosomes into two genetically identical daughter cells.'),
(13, 'hematology-and-oncology', array['medicine','paediatrics'],
 'A patient has fatigue, pallor, low hemoglobin, low mean cell volume, and low ferritin. Which diagnosis is most likely?',
 'Iron deficiency anemia', 'Vitamin B12 deficiency', 'Hereditary spherocytosis', 'Aplastic crisis',
 'Microcytic anemia with depleted ferritin stores is most consistent with iron deficiency.'),
(14, 'hematology-and-oncology', array['medicine','surgery'],
 'A patient receiving chemotherapy has fever and a very low neutrophil count. What is the immediate management priority?',
 'Prompt empiric broad-spectrum antibiotics', 'Wait for culture results before treatment', 'Give an iron infusion only', 'Schedule routine clinic review next month',
 'Febrile neutropenia is an emergency and requires prompt empiric broad-spectrum antimicrobial treatment after rapid assessment and cultures.'),
(15, 'infectious-diseases', array['medicine','paediatrics'],
 'A patient has fever, neck stiffness, photophobia, and altered mental status. Which serious diagnosis must be considered immediately?',
 'Acute meningitis', 'Tension headache', 'Benign positional vertigo', 'Carpal tunnel syndrome',
 'Fever, meningism, and altered mental status are red flags for acute meningitis and require emergency assessment.'),
(16, 'infectious-diseases', array['medicine','obstetrics-and-gynaecology'],
 'Which maternal infection screening result requires measures to reduce vertical transmission during labor and after birth?',
 'A transmissible blood-borne or perinatal infection identified on antenatal screening', 'An old healed ankle fracture', 'Seasonal allergic rhinitis', 'Simple myopia',
 'Antenatal infection screening identifies conditions for which intrapartum or neonatal interventions can reduce vertical transmission.'),
(17, 'male-reproductive', array['medicine','surgery'],
 'An adolescent develops sudden severe unilateral scrotal pain with a high-riding testis. What is the priority diagnosis?',
 'Testicular torsion', 'Chronic hydrocele', 'Varicocele', 'Benign prostatic hyperplasia',
 'Sudden severe pain and an abnormal testicular lie suggest torsion, a time-critical surgical emergency.'),
(18, 'nervous-system', array['medicine','surgery'],
 'A patient develops sudden facial droop, arm weakness, and speech difficulty one hour ago. What is the first imaging study usually required?',
 'Urgent non-contrast CT of the head', 'Elective lumbar spine radiograph', 'Routine abdominal ultrasound', 'Screening mammography',
 'Urgent brain imaging distinguishes hemorrhage from ischemia and guides time-sensitive acute stroke treatment.'),
(19, 'nervous-system', array['medicine','paediatrics'],
 'A child has a generalized convulsion lasting longer than five minutes. Which term describes this emergency?',
 'Convulsive status epilepticus', 'Simple syncope', 'Absence seizure only', 'Night terror',
 'A convulsive seizure lasting five minutes or longer should be treated as convulsive status epilepticus.'),
(20, 'ophthalmology', array['medicine','surgery'],
 'A patient has sudden painful loss of vision, a red eye, halos, and a fixed mid-dilated pupil. Which diagnosis is most likely?',
 'Acute angle-closure glaucoma', 'Chronic open-angle glaucoma', 'Simple conjunctivitis', 'Refractive error',
 'Painful visual loss with a fixed mid-dilated pupil is characteristic of acute angle-closure glaucoma.'),
(21, 'poisoning-and-environmental', array['medicine','paediatrics'],
 'A child has pinpoint pupils, respiratory depression, and reduced consciousness after an unknown ingestion. Which toxidrome is most likely?',
 'Opioid toxicity', 'Anticholinergic toxicity', 'Serotonin syndrome', 'Sympathomimetic toxicity',
 'Miosis, respiratory depression, and depressed consciousness form the classic opioid toxidrome.'),
(22, 'pregnancy-and-childbirth', array['obstetrics-and-gynaecology','medicine'],
 'A pregnant patient at 34 weeks has hypertension, proteinuria, headache, and visual symptoms. Which diagnosis is most concerning?',
 'Preeclampsia with severe features', 'Uncomplicated morning sickness', 'Physiologic ankle edema only', 'Normal pregnancy adaptation',
 'Hypertension with proteinuria and neurologic symptoms after 20 weeks is concerning for preeclampsia with severe features.'),
(23, 'pregnancy-and-childbirth', array['obstetrics-and-gynaecology','surgery'],
 'After delivery, a patient has heavy bleeding and a soft enlarged uterus. What is the most likely cause?',
 'Uterine atony', 'Ectopic pregnancy', 'Endometriosis', 'Hyperemesis gravidarum',
 'A boggy enlarged uterus with postpartum hemorrhage most commonly indicates uterine atony.'),
(24, 'psychiatric-behavioral-and-substance-use', array['psychiatry','medicine'],
 'A patient has persistent low mood, loss of interest, poor sleep, and impaired function for four weeks. Which diagnosis should be assessed?',
 'Major depressive episode', 'Acute delirium by definition', 'Specific phobia only', 'Normal mood variation only',
 'Persistent depressed mood or anhedonia with associated symptoms and functional impairment warrants assessment for major depression.'),
(25, 'psychiatric-behavioral-and-substance-use', array['psychiatry','paediatrics'],
 'An adolescent reports suicidal thoughts with a specific plan and access to means. What is the immediate priority?',
 'Urgent safety assessment and protection', 'Routine review in six months', 'Confidential reassurance only', 'No action unless an attempt occurs',
 'A specific suicide plan with access to means indicates high acute risk and requires immediate safety intervention.'),
(26, 'pulmonary-and-critical-care', array['medicine','paediatrics'],
 'A patient with asthma cannot complete sentences, has low oxygen saturation, and uses accessory muscles. How should this presentation be classified?',
 'A severe acute asthma exacerbation', 'Well-controlled asthma', 'Simple viral rhinitis', 'Stable chronic bronchitis',
 'Marked respiratory distress, hypoxemia, and inability to speak normally indicate a severe acute asthma exacerbation.'),
(27, 'pulmonary-and-critical-care', array['medicine','surgery'],
 'After central venous access, a patient becomes acutely breathless with unilateral absent breath sounds and hypotension. Which diagnosis is most likely?',
 'Tension pneumothorax', 'Pleural effusion developing over years', 'Stable pulmonary fibrosis', 'Uncomplicated bronchitis',
 'Acute respiratory compromise, hypotension, and unilateral absent breath sounds after a procedure suggest tension pneumothorax.'),
(28, 'renal-and-urinary', array['medicine','paediatrics'],
 'A child develops periorbital edema, heavy proteinuria, low serum albumin, and hyperlipidemia. Which syndrome is present?',
 'Nephrotic syndrome', 'Nephritic syndrome without protein loss', 'Diabetes insipidus', 'Renal tubular acidosis only',
 'Heavy proteinuria, hypoalbuminemia, edema, and hyperlipidemia define nephrotic syndrome.'),
(29, 'rheumatology-orthopedics-and-sports', array['medicine','surgery'],
 'A patient has a hot swollen knee, fever, and severe pain on passive movement. Which diagnosis must be excluded urgently?',
 'Septic arthritis', 'Stable osteoarthritis', 'Chronic tendinopathy', 'Simple muscle strain',
 'An acutely hot joint with fever and painful restricted movement requires urgent evaluation for septic arthritis.'),
(30, 'social-sciences', array['medicine','psychiatry'],
 'A competent adult refuses a recommended treatment after understanding the risks and alternatives. Which ethical principle supports this decision?',
 'Respect for autonomy', 'Paternalism in every circumstance', 'Non-disclosure', 'Treatment without consent',
 'A patient with decision-making capacity may refuse treatment after receiving and understanding relevant information.');

do $$
declare
  exam record;
  template record;
  saved_question_id uuid;
  subject_slug text;
begin
  for exam in select id, code from public.exams loop
    for template in select * from sample_question_templates order by template_id loop
      insert into public.questions(
        exam_id,
        stem,
        educational_objective,
        explanation,
        high_yield_summary,
        difficulty,
        status,
        source_references,
        published_at,
        import_key
      ) values (
        exam.id,
        template.stem,
        'Recognize the key presentation and select the most appropriate answer.',
        template.explanation,
        template.correct_answer,
        'medium',
        'live',
        jsonb_build_array(jsonb_build_object(
          'title', 'Magna-Q illustrative practice content',
          'url', 'https://medinexus.africa'
        )),
        now(),
        'create-test-sample-' || exam.code::text || '-' || template.template_id
      )
      on conflict (import_key) do update set
        stem = excluded.stem,
        explanation = excluded.explanation,
        updated_at = now()
      returning id into saved_question_id;

      delete from public.question_options
      where question_id = saved_question_id;
      delete from public.question_subjects
      where question_id = saved_question_id;
      delete from public.question_categories
      where question_id = saved_question_id;

      insert into public.question_options(
        question_id,
        option_text,
        is_correct,
        distractor_rationale,
        explanation,
        sort_order
      ) values
        (saved_question_id, template.correct_answer, true, null, template.explanation, 0),
        (saved_question_id, template.distractor_one, false, 'This option does not best fit the key findings.', 'This option does not best fit the key findings.', 1),
        (saved_question_id, template.distractor_two, false, 'This option does not best fit the key findings.', 'This option does not best fit the key findings.', 2),
        (saved_question_id, template.distractor_three, false, 'This option does not best fit the key findings.', 'This option does not best fit the key findings.', 3);

      foreach subject_slug in array template.subject_slugs loop
        insert into public.question_subjects(
          question_id,
          subject_id,
          question_exam_id,
          subject_exam_id
        )
        select saved_question_id, s.id, exam.id, exam.id
        from public.subjects s
        where s.exam_id = exam.id and s.slug = subject_slug;
      end loop;

      insert into public.question_categories(
        question_id,
        category_id,
        question_exam_id,
        category_exam_id
      )
      select saved_question_id, c.id, exam.id, exam.id
      from public.categories c
      where c.exam_id = exam.id and c.slug = template.system_slug;
    end loop;
  end loop;
end $$;

update public.questions
set key_phrases = case
  when import_key like '%-1' then array['wheeze', 'urticaria', 'hypotension', 'groundnuts']
  when import_key like '%-2' then array['screening test', 'sensitivity']
  when import_key like '%-3' then array['crushing central chest pain', 'ST elevation']
  when import_key like '%-4' then array['tearing chest pain', 'unequal arm blood pressures']
  when import_key like '%-5' then array['flexural eczema', 'chronic relapsing course']
  when import_key like '%-6' then array['ear pain', 'bulging, opaque tympanic membrane']
  when import_key like '%-7' then array['ketones', 'high anion-gap acidosis', 'deep breathing']
  when import_key like '%-8' then array['pregnant', 'abnormal oral glucose tolerance test']
  when import_key like '%-9' then array['painless breast lump']
  when import_key like '%-10' then array['right upper-quadrant pain', 'positive Murphy sign']
  when import_key like '%-11' then array['chronic diarrhea', 'poor growth', 'iron deficiency']
  when import_key like '%-12' then array['genetically identical daughter cells']
  when import_key like '%-13' then array['low mean cell volume', 'low ferritin']
  when import_key like '%-14' then array['chemotherapy', 'fever', 'very low neutrophil count']
  when import_key like '%-15' then array['fever', 'neck stiffness', 'altered mental status']
  when import_key like '%-16' then array['vertical transmission', 'antenatal screening']
  when import_key like '%-17' then array['sudden severe unilateral scrotal pain', 'high-riding testis']
  when import_key like '%-18' then array['sudden facial droop', 'arm weakness', 'speech difficulty']
  when import_key like '%-19' then array['generalized convulsion', 'longer than five minutes']
  when import_key like '%-20' then array['painful loss of vision', 'fixed mid-dilated pupil']
  when import_key like '%-21' then array['pinpoint pupils', 'respiratory depression']
  when import_key like '%-22' then array['hypertension', 'proteinuria', 'visual symptoms']
  when import_key like '%-23' then array['heavy bleeding', 'soft enlarged uterus']
  when import_key like '%-24' then array['persistent low mood', 'loss of interest', 'four weeks']
  when import_key like '%-25' then array['suicidal thoughts', 'specific plan', 'access to means']
  when import_key like '%-26' then array['cannot complete sentences', 'low oxygen saturation']
  when import_key like '%-27' then array['unilateral absent breath sounds', 'hypotension']
  when import_key like '%-28' then array['heavy proteinuria', 'low serum albumin', 'hyperlipidemia']
  when import_key like '%-29' then array['hot swollen knee', 'pain on passive movement']
  when import_key like '%-30' then array['competent adult', 'refuses', 'risks and alternatives']
  else key_phrases
end
where import_key like 'create-test-sample-%';

drop table sample_question_templates;

commit;
