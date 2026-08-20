import type { ResourceVideo } from "@/lib/resources/videos";

export function YoutubeVideoCard({ video }: { video: ResourceVideo }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-video bg-slate-950">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.id}`}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <h3 className="p-4 font-bold leading-6 text-slate-900">{video.title}</h3>
    </article>
  );
}
