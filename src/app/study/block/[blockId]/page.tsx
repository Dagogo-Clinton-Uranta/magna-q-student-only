import { notFound } from "next/navigation";
import { QuestionPlayer } from "@/components/study/question-player";
import { requirePaidStudent } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

export default async function BlockPage({
  params,
}: {
  params: Promise<{ blockId: string }>;
}) {
  const { blockId } = await params;
  const { profile } = await requirePaidStudent(`/study/block/${blockId}`);
  const supabase = await createClient();
  const { data: block } = await supabase
    .from("test_blocks")
    .select("id,current_position,status")
    .eq("id", blockId)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!block || ["completed", "abandoned"].includes(block.status)) notFound();
  const { data: question, error } = await supabase.rpc(
    "student_get_block_question",
    { target_block_id: blockId, target_position: block.current_position },
  );
  if (error || !question) notFound();
  const shaped = question as Record<string, unknown>;
  if (typeof shaped.imagePath === "string" && shaped.imagePath) {
    // The paid, ownership-checking RPC above returned this exact private object
    // path. Use the server-only service client only to mint its five-minute URL;
    // students are not granted broad read access to draft question assets.
    const { data: signed } = await createServiceRoleClient()
      .storage.from("question-images")
      .createSignedUrl(shaped.imagePath, 300);
    shaped.imageUrl = signed?.signedUrl ?? null;
  }
  delete shaped.imagePath;
  const { data: note } = await supabase
    .from("user_question_notes")
    .select("note_text")
    .eq("user_id", profile.id)
    .eq("question_id", (shaped as { questionId: string }).questionId)
    .maybeSingle();
  return (
    <QuestionPlayer
      initial={shaped as never}
      initialNote={note?.note_text ?? ""}
    />
  );
}
