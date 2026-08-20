export function ChronologicalTimeline({
  items,
}: {
  items: { stage: string; timing: string; detail: string }[];
}) {
  return (
    <ol className="relative mt-7 space-y-0 border-l-2 border-blue-200 pl-7">
      {items.map((item, index) => (
        <li key={item.stage} className="relative pb-8 last:pb-0">
          <span className="absolute -left-[2.3rem] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-800 text-sm font-black text-white">
            {index + 1}
          </span>
          <p className="text-sm font-bold text-blue-800">{item.timing}</p>
          <h3 className="mt-1 text-lg font-bold">{item.stage}</h3>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            {item.detail}
          </p>
        </li>
      ))}
    </ol>
  );
}
