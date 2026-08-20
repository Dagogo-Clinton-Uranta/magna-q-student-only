import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.STUDENT_BOOTSTRAP_EMAIL;
const password = process.env.STUDENT_BOOTSTRAP_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  throw new Error(
    "Supabase credentials, STUDENT_BOOTSTRAP_EMAIL and STUDENT_BOOTSTRAP_PASSWORD are required.",
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    fetch: (input, init) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }),
  },
});

let user;
for (let page = 1; page <= 20 && !user; page += 1) {
  const result = await supabase.auth.admin.listUsers({ page, perPage: 100 });
  if (result.error) throw result.error;
  user = result.data.users.find(
    (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
  );
  if (result.data.users.length < 100) break;
}

if (user) {
  const result = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: { ...user.user_metadata, full_name: "Magna-Q Student" },
  });
  if (result.error) throw result.error;
  user = result.data.user;
} else {
  const result = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Magna-Q Student" },
  });
  if (result.error) throw result.error;
  user = result.data.user;
}

const profile = await supabase.from("profiles").upsert(
  {
    id: user.id,
    full_name: "Magna-Q Student",
    country_code: "NG",
    medical_school: "Magna-Q",
    training_level: "Medical graduate",
    target_exam: "step2ck",
    role: "student",
    onboarding_completed: true,
  },
  { onConflict: "id" },
);
if (profile.error) throw profile.error;

const verification = await supabase
  .from("profiles")
  .select("id,role,onboarding_completed")
  .eq("id", user.id)
  .single();
if (verification.error) throw verification.error;

console.log(
  JSON.stringify({
    ok:
      verification.data.role === "student" &&
      verification.data.onboarding_completed,
    email: user.email,
    userId: user.id,
    role: verification.data.role,
  }),
);
