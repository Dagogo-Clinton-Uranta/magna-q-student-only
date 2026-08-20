import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { BlogReadTracker } from "@/components/blog/blog-read-tracker";

type Source = { title: string; url: string };

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (!post) notFound();
  const fallbackSource = Array.isArray(post.source_links)
    ? (post.source_links as Source[])[0]
    : undefined;
  const paragraphs = [
    post.paragraph_1,
    post.paragraph_2,
    post.paragraph_3,
    post.paragraph_4,
  ].map(
    (paragraph, index) =>
      paragraph ?? String(post.content).split("\n\n")[index] ?? "",
  );
  const images = [
    post.image_url_1 ?? post.image_urls[0],
    post.image_url_2 ?? post.image_urls[1],
  ];
  const relevantLink = post.relevant_link ?? fallbackSource?.url;
  const linkTitle = post.link_title ?? fallbackSource?.title;
  return (
    <AppShell title="Community blog" name={profile.fullName}>
      <BlogReadTracker postId={post.id} />
      <article className="mx-auto mt-5 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            {post.category}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            By {post.author_name} ·{" "}
            {post.published_at
              ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
                  new Date(post.published_at),
                )
              : ""}
          </p>
          <div className="mt-8 text-lg leading-8 text-slate-700">
            <p>{paragraphs[0]}</p>
            <ArticleImage
              url={images[0]}
              alt={post.image_alt_texts[0] ?? `${post.title} — image 1`}
              priority
            />
            <p>{paragraphs[1]}</p>
            <p className="mt-6">{paragraphs[2]}</p>
            <ArticleImage
              url={images[1]}
              alt={post.image_alt_texts[1] ?? `${post.title} — image 2`}
            />
            <p>{paragraphs[3]}</p>
          </div>
          {relevantLink && linkTitle && (
            <aside className="mt-10 rounded-xl bg-slate-50 p-5">
              <h2 className="font-bold">{linkTitle}</h2>
              <a
                href={relevantLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block break-all font-semibold text-blue-800 underline"
              >
                {relevantLink}
              </a>
            </aside>
          )}
          <Link
            href="/blogs"
            className="mt-8 inline-flex min-h-11 items-center font-bold text-blue-800"
          >
            ← Back to all blogs
          </Link>
        </div>
      </article>
    </AppShell>
  );
}

function ArticleImage({
  url,
  alt,
  priority = false,
}: {
  url: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative my-7 aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={url}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 896px) 100vw, 832px"
        className="object-cover"
      />
    </div>
  );
}
