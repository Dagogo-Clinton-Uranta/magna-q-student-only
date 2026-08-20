import Image from "next/image";
import Link from "next/link";

export type BlogSummary = {
  id: string;
  title: string;
  paragraph_1: string;
  category: string;
  author_name: string;
  published_at: string | null;
  image_urls: string[];
  image_alt_texts: string[];
};

export function BlogCard({ post }: { post: BlogSummary }) {
  const images = post.image_urls.slice(0, 1);
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`grid h-52 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {images.map((url, index) => (
          <div key={url} className="relative overflow-hidden">
            <Image
              src={url}
              alt={post.image_alt_texts[index] ?? "Medical education article"}
              fill
              sizes={
                images.length > 1
                  ? "(max-width: 768px) 50vw, 25vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
              className="object-cover transition duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
          {post.category}
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug text-slate-950">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-4 leading-7 text-slate-600">
          {post.paragraph_1}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
          <span className="text-slate-500">
            {post.published_at
              ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                  new Date(post.published_at),
                )
              : ""}
          </span>
          <Link
            href={`/blogs/${post.id}`}
            className="font-bold text-blue-800 hover:underline"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
