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
  const sourceLinks = Array.isArray(post.source_links)
    ? (post.source_links as unknown[]).filter(
        (source): source is Source =>
          typeof source === "object" &&
          source !== null &&
          "title" in source &&
          typeof source.title === "string" &&
          "url" in source &&
          typeof source.url === "string" &&
          /^https?:\/\//.test(source.url),
      )
    : [];
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
  if (
    sourceLinks.length === 0 &&
    typeof post.relevant_link === "string" &&
    /^https?:\/\//.test(post.relevant_link)
  ) {
    sourceLinks.push({
      title: post.link_title ?? "Further reading",
      url: post.relevant_link,
    });
  }
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
          {sourceLinks.length > 0 && (
            <aside className="mt-10 rounded-xl bg-slate-50 p-5">
              <h2 className="font-bold">Sources and further reading</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use these primary sources to verify dates, policy status, and
                medical claims before relying on this editorial summary.
              </p>
              <ul className="mt-4 space-y-3">
                {sourceLinks.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-800 underline underline-offset-2"
                    >
                      {source.title} ↗
                    </a>
                  </li>
                ))}
              </ul>
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
