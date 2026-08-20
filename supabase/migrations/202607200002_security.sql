begin;

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger subjects_updated before update on public.subjects for each row execute function public.set_updated_at();
create trigger categories_updated before update on public.categories for each row execute function public.set_updated_at();
create trigger questions_updated before update on public.questions for each row execute function public.set_updated_at();
create trigger options_updated before update on public.question_options for each row execute function public.set_updated_at();
create trigger notes_updated before update on public.user_question_notes for each row execute function public.set_updated_at();
create trigger library_updated before update on public.medical_library_entries for each row execute function public.set_updated_at();

create function public.current_user_role() returns public.user_role language sql stable security definer
set search_path = '' as $$ select role from public.profiles where id = auth.uid() $$;
revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

create function public.prevent_role_escalation() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role
     and coalesce(public.current_user_role(), 'student') <> 'admin'
     and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'role changes require an administrator' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profile_role_guard before update of role on public.profiles for each row execute function public.prevent_role_escalation();

create function public.enforce_subject_category_exam() returns trigger language plpgsql set search_path = '' as $$
declare subject_exam uuid; category_exam uuid;
begin
  select exam_id into subject_exam from public.subjects where id = new.subject_id;
  select exam_id into category_exam from public.categories where id = new.category_id;
  if subject_exam is distinct from category_exam then raise exception 'subject and category must belong to the same exam'; end if;
  return new;
end $$;
create trigger subject_category_exam_guard before insert or update on public.subject_categories for each row execute function public.enforce_subject_category_exam();

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.subjects enable row level security;
alter table public.categories enable row level security;
alter table public.subject_categories enable row level security;
alter table public.questions enable row level security;
alter table public.question_subjects enable row level security;
alter table public.question_categories enable row level security;
alter table public.question_options enable row level security;
alter table public.review_events enable row level security;
alter table public.question_review_comments enable row level security;
alter table public.test_blocks enable row level security;
alter table public.test_block_questions enable row level security;
alter table public.answer_logs enable row level security;
alter table public.user_question_marks enable row level security;
alter table public.user_question_notes enable row level security;
alter table public.question_stats enable row level security;
alter table public.error_reports enable row level security;
alter table public.medical_library_entries enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid() or public.current_user_role() = 'admin');
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid() or public.current_user_role() = 'admin') with check (id = auth.uid() or public.current_user_role() = 'admin');
create policy profiles_insert_own_student on public.profiles for insert to authenticated with check (id = auth.uid() and role = 'student');

create policy exams_read_active on public.exams for select to authenticated using (active or public.current_user_role() in ('reviewer','admin'));
create policy subjects_read_active on public.subjects for select to authenticated using (active or public.current_user_role() in ('reviewer','admin'));
create policy categories_read_active on public.categories for select to authenticated using (active or public.current_user_role() in ('reviewer','admin'));
create policy mappings_read on public.subject_categories for select to authenticated using (true);

create policy questions_staff_read on public.questions for select to authenticated using (
  public.current_user_role() = 'admin' or (public.current_user_role() = 'reviewer' and reviewer_id = auth.uid())
);
create policy questions_admin_all on public.questions for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy question_subjects_staff on public.question_subjects for all to authenticated using (public.current_user_role() = 'admin' or exists (select 1 from public.questions q where q.id = question_id and q.reviewer_id = auth.uid())) with check (public.current_user_role() = 'admin');
create policy question_categories_staff on public.question_categories for all to authenticated using (public.current_user_role() = 'admin' or exists (select 1 from public.questions q where q.id = question_id and q.reviewer_id = auth.uid())) with check (public.current_user_role() = 'admin');
create policy options_staff_read on public.question_options for select to authenticated using (exists (select 1 from public.questions q where q.id = question_id and (public.current_user_role() = 'admin' or q.reviewer_id = auth.uid())));
create policy options_admin_write on public.question_options for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy blocks_own on public.test_blocks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy block_questions_own_read on public.test_block_questions for select to authenticated using (exists (select 1 from public.test_blocks b where b.id = block_id and b.user_id = auth.uid()));
create policy answers_own_read on public.answer_logs for select to authenticated using (user_id = auth.uid());
create policy marks_own on public.user_question_marks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_own on public.user_question_notes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reports_own_insert on public.error_reports for insert to authenticated with check (user_id = auth.uid());
create policy reports_own_read on public.error_reports for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy library_live_read on public.medical_library_entries for select to authenticated using (status = 'live' or public.current_user_role() = 'admin');
create policy review_events_staff_read on public.review_events for select to authenticated using (public.current_user_role() = 'admin' or exists (select 1 from public.questions q where q.id = question_id and q.reviewer_id = auth.uid()));
create policy review_comments_staff on public.question_review_comments for select to authenticated using (public.current_user_role() = 'admin' or reviewer_id = auth.uid());
create policy stats_staff on public.question_stats for select to authenticated using (public.current_user_role() in ('reviewer','admin'));

-- Direct student access to questions/options is intentionally absent. Later phases expose deliberately shaped security-definer RPCs.
revoke all on all tables in schema public from anon;
grant select on public.exams, public.subjects, public.categories, public.subject_categories to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.questions, public.question_subjects, public.question_categories, public.question_options to authenticated;
grant select, insert, update on public.test_blocks, public.test_block_questions, public.answer_logs to authenticated;
grant select, insert, update, delete on public.user_question_marks, public.user_question_notes to authenticated;
grant select, insert on public.error_reports to authenticated;
grant select on public.medical_library_entries, public.review_events, public.question_review_comments, public.question_stats to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('question-images', 'question-images', false, 10485760, array['image/webp','image/png','image/jpeg'])
on conflict (id) do nothing;

commit;
